<?php
/**
 * SPARTANZ 3.0 — Public Visitor Tracker Script
 * Logs visitor information (Timestamp, IP, Country/Location, Visit Count, Referrer, User Agent)
 * Appends entries down into track_cyber.txt (accessible publicly without login).
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$logFile = __DIR__ . '/track_cyber.txt';
$rootLogFile = dirname(__DIR__) . '/track_cyber.txt';

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

$visitCount = 1;
if (file_exists($logFile)) {
    $existingContent = @file_get_contents($logFile);
    if ($existingContent !== false) {
        $matches = [];
        preg_match_all('/\| IP:\s*' . preg_quote($ip, '/') . '\b/i', $existingContent, $matches);
        $visitCount = count($matches[0]) + 1;
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

@file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
if (file_exists(dirname($rootLogFile))) {
    @file_put_contents($rootLogFile, $logLine, FILE_APPEND | LOCK_EX);
}

if (isset($_GET['view']) || (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'text/html') && !isset($_GET['silent']))) {
    header('Content-Type: text/plain; charset=utf-8');
    if (file_exists($logFile)) {
        readfile($logFile);
    } else {
        echo $logLine;
    }
    exit();
}

header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'logged_at' => $timestamp,
    'ip' => $ip,
    'location' => $locationStr,
    'visit_count' => $visitCount
]);
