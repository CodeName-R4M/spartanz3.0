<?php
/**
 * SPARTANZ 3.0 — Visitor Tracker Script & Self-Healing Telemetry Vault
 * Logs visitor information (Timestamp, IP, Country/Location, Visit Count, Referrer, User Agent)
 * Appends entries into track_cyber.txt and persistent vaults.
 * Automatically recovers and restores historic logs if track_cyber.txt is ever replaced during deployment.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Vault Storage Locations
$primaryLog    = __DIR__ . '/track_cyber.txt';
$hiddenVault   = __DIR__ . '/.track_cyber_vault.log';
$backupLog     = __DIR__ . '/track_cyber.txt.bak';
// Outside webroot on cPanel (/home/user/): completely immune to git pulls / web deployments
$externalVault = dirname(__DIR__) . '/spartanz_track_cyber_vault.log';

/**
 * Self-healing sync: collects all historic entries across all vaults
 * and ensures every vault and the primary track_cyber.txt have the complete history.
 */
function syncAndHealLogs($primaryLog, $hiddenVault, $externalVault, $backupLog) {
    $allLines = [];
    $vaults = [$externalVault, $hiddenVault, $backupLog, $primaryLog];

    foreach ($vaults as $v) {
        if (file_exists($v)) {
            $content = @file_get_contents($v);
            if ($content) {
                $lines = explode("\n", $content);
                foreach ($lines as $line) {
                    $trimmed = trim($line);
                    if (!empty($trimmed) && str_contains($trimmed, '| IP:')) {
                        $allLines[$trimmed] = true;
                    }
                }
            }
        }
    }

    if (!empty($allLines)) {
        $header = "# SPARTANZ 3.0 // CYBER VISITOR LOG\n# Persistent Live Visitor Telemetry (Self-Healing Enabled)\n";
        $fullLog = $header . implode("\n", array_keys($allLines)) . "\n";

        // Check if primary track_cyber.txt is missing entries or was overwritten by deploy
        $currentPrimary = file_exists($primaryLog) ? @file_get_contents($primaryLog) : '';
        $primaryCount = substr_count($currentPrimary, '| IP:');
        
        if ($primaryCount < count($allLines)) {
            @file_put_contents($primaryLog, $fullLog, LOCK_EX);
        }

        // Keep all vaults synchronised
        @file_put_contents($hiddenVault, $fullLog, LOCK_EX);
        @file_put_contents($backupLog, $fullLog, LOCK_EX);
        
        $extDir = dirname($externalVault);
        if (is_dir($extDir) && is_writable($extDir)) {
            @file_put_contents($externalVault, $fullLog, LOCK_EX);
        } elseif (file_exists($externalVault) && is_writable($externalVault)) {
            @file_put_contents($externalVault, $fullLog, LOCK_EX);
        }
    }

    return $allLines;
}

// 2. Client IP Resolution
function getClientIp() {
    $headers = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_CLIENT_IP',
        'HTTP_X_REAL_IP',
        'REMOTE_ADDR'
    ];
    foreach ($headers as $h) {
        if (!empty($_SERVER[$h])) {
            $ipList = explode(',', $_SERVER[$h]);
            $ip = trim($ipList[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

$ip = getClientIp();

// 3. Location / Country Resolution
$country = $_SERVER['HTTP_CF_IPCOUNTRY'] ?? $_SERVER['HTTP_GEOIP_COUNTRY_NAME'] ?? '';
$city = $_SERVER['HTTP_CF_IPCITY'] ?? '';

if (empty($country) && $ip !== '127.0.0.1' && $ip !== '::1' && !str_starts_with($ip, '192.168.') && !str_starts_with($ip, '10.')) {
    $geoContext = stream_context_create(['http' => ['timeout' => 1]]);
    $geo = @json_decode(@file_get_contents("http://ip-api.com/json/{$ip}?fields=status,country,countryCode,city", false, $geoContext), true);
    if (!empty($geo) && ($geo['status'] ?? '') === 'success') {
        $country = $geo['country'] . ' (' . $geo['countryCode'] . ')';
        $city = $geo['city'] ?? '';
    }
}

if (empty($country)) {
    $locationStr = ($ip === '127.0.0.1' || $ip === '::1') ? 'Localhost' : 'Unknown Origin';
} else {
    $locationStr = !empty($city) ? "{$city}, {$country}" : $country;
}

// 4. Run self-healing and load existing log history
$historicLines = syncAndHealLogs($primaryLog, $hiddenVault, $externalVault, $backupLog);

// 5. Calculate Appearance Count for this visitor
$visitCount = 1;
foreach (array_keys($historicLines) as $line) {
    if (str_contains($line, "| IP: {$ip} ") || str_contains($line, "| IP: {$ip}|") || preg_match('/\| IP:\s*' . preg_quote($ip, '/') . '\b/i', $line)) {
        $visitCount++;
    }
}

$referrer = !empty($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'Direct';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown UA';
$timestamp = date('Y-m-d H:i:s T');

$logLine = sprintf(
    "[%s] | IP: %-15s | Location: %-25s | Appearance Count: #%-4d | Referrer: %-20s | UA: %s\n",
    $timestamp,
    $ip,
    $locationStr,
    $visitCount,
    $referrer,
    $userAgent
);

// 6. Append to primary log and all persistent vaults
@file_put_contents($primaryLog, $logLine, FILE_APPEND | LOCK_EX);
@file_put_contents($hiddenVault, $logLine, FILE_APPEND | LOCK_EX);
@file_put_contents($backupLog, $logLine, FILE_APPEND | LOCK_EX);

$extDir = dirname($externalVault);
if (is_dir($extDir) && is_writable($extDir)) {
    @file_put_contents($externalVault, $logLine, FILE_APPEND | LOCK_EX);
} elseif (file_exists($externalVault) && is_writable($externalVault)) {
    @file_put_contents($externalVault, $logLine, FILE_APPEND | LOCK_EX);
}

// 7. If requested with ?view=1, or routed by .htaccess, or opened in browser without silent
if (isset($_GET['view']) || (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'text/html') && !isset($_GET['silent']))) {
    header('Content-Type: text/plain; charset=utf-8');
    if (file_exists($primaryLog)) {
        readfile($primaryLog);
    } else {
        echo $logLine;
    }
    exit();
}

// 8. Silent API response
header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'logged_at' => $timestamp,
    'ip' => $ip,
    'location' => $locationStr,
    'visit_count' => $visitCount,
    'total_entries' => count($historicLines) + 1
]);
