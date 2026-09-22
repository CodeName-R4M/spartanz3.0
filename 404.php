<?php
/**
 * SPARTANZ 3.0 — Custom 404 & Route Self-Healing Engine
 * Intercepts missing files, auto-heals event slug variations,
 * and renders a branded Formula 1 Pit Control 404 instead of the hoster's default error page.
 */

// 1. Resolve Requested Path
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedPath = parse_url($requestUri, PHP_URL_PATH) ?? '/';
$cleanPath  = trim($parsedPath, '/');
$docRoot    = __DIR__;

// 2. Smart Self-Healing for Event Slugs & Common Typos
$eventAliases = [
    'cyberforge'                 => 'cyberforgex-ai',
    'cyberforge-ai'              => 'cyberforgex-ai',
    'cyberforgex'                => 'cyberforgex-ai',
    'cyberforgex-ai'             => 'cyberforgex-ai',
    'ideanix'                    => 'ideanix-paper-presentation',
    'paper-presentation'         => 'ideanix-paper-presentation',
    'mystery-unleashed'          => 'mystery',
    'cine-heist'                 => 'Cineheist',
    'cineheist'                  => 'Cineheist',
    'the-unscripted'             => 'unscripted',
    'ai-escape'                  => 'aiescape',
    'aiescaperoom'               => 'aiescape',
    'flag-rush'                  => 'flagrush',
    'vuln-hunt'                  => 'vulnhunt',
    'forenscrypt'                => 'forensc',
    'courtroom'                  => 'court',
    'courtroom-chaos'            => 'court',
    'free-fire'                  => 'freefire',
];

// Check if request is under /events/
if (preg_match('#^events/([^/]+)/?$#i', $cleanPath, $matches)) {
    $requestedSlug = strtolower(trim($matches[1]));
    
    // Check if alias exists
    if (isset($eventAliases[$requestedSlug])) {
        $canonicalSlug = $eventAliases[$requestedSlug];
        // Check if canonical static HTML exists on disk
        $targetDir = $docRoot . '/events/' . $canonicalSlug . '/index.html';
        $targetFile = $docRoot . '/events/' . $canonicalSlug . '.html';
        
        if (file_exists($targetDir) || file_exists($targetFile)) {
            // Permanent redirect to canonical path
            header('Location: /events/' . $canonicalSlug . '/', true, 301);
            exit();
        }
    }

    // Direct case-insensitive folder lookup
    $eventsDir = $docRoot . '/events';
    if (is_dir($eventsDir)) {
        $dirs = scandir($eventsDir);
        foreach ($dirs as $d) {
            if ($d !== '.' && $d !== '..' && strtolower($d) === $requestedSlug) {
                if (file_exists($eventsDir . '/' . $d . '/index.html')) {
                    header('Location: /events/' . $d . '/', true, 301);
                    exit();
                }
            }
        }
    }
}

// 3. Fallback to existing static pages if missing trailing slash
if (!empty($cleanPath)) {
    $dirIndex = $docRoot . '/' . $cleanPath . '/index.html';
    $fileHtml = $docRoot . '/' . $cleanPath . '.html';

    if (file_exists($dirIndex)) {
        header('Location: /' . $cleanPath . '/', true, 301);
        exit();
    } elseif (file_exists($fileHtml)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($fileHtml);
        exit();
    }
}

// 4. Log 404 Telemetry
function logNotFoundEvent($docRoot, $requestUri) {
    $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    $ip = '127.0.0.1';
    foreach ($headers as $h) {
        if (!empty($_SERVER[$h])) {
            $ipList = explode(',', $_SERVER[$h]);
            $ip = trim($ipList[0]);
            break;
        }
    }

    $timestamp = date('Y-m-d H:i:s T');
    $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown UA', 0, 100);
    $referrer  = $_SERVER['HTTP_REFERER'] ?? 'Direct';
    $entry     = "[404 NOT FOUND] {$timestamp} | IP: {$ip} | URI: {$requestUri} | REF: {$referrer} | UA: {$userAgent}\n";

    $logFile = $docRoot . '/.404_audit.log';
    @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
}

logNotFoundEvent($docRoot, $requestUri);

// 5. Check if Next.js pre-compiled 404.html exists
$next404 = $docRoot . '/404.html';
if (file_exists($next404) && !isset($_GET['branded'])) {
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    readfile($next404);
    exit();
}

// 6. Standalone High-Octane SPARTANZ 3.0 Formula 1 Race Control 404
http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
$safeUri = htmlspecialchars($requestUri, ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 // Off Track — SPARTANZ 3.0</title>
  <meta name="robots" content="noindex, follow">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <style>
    :root {
      --primary: #e10600;
      --primary-glow: rgba(225, 6, 0, 0.4);
      --bg: #07070a;
      --card-bg: #101017;
      --border: #22222e;
      --text: #f3f4f6;
      --text-muted: #8b8b9e;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background-image: 
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(225, 6, 0, 0.15), transparent),
        radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0);
      background-size: 100% 100%, 24px 24px;
      overflow-x: hidden;
    }
    .hud-box {
      max-width: 580px;
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2.5rem 2rem;
      position: relative;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 20px -5px var(--primary-glow);
    }
    .hud-box::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), transparent 80%);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--primary);
      background: rgba(225, 6, 0, 0.1);
      border: 1px solid rgba(225, 6, 0, 0.25);
      padding: 0.25rem 0.65rem;
      border-radius: 4px;
      margin-bottom: 1.25rem;
    }
    .beacon {
      width: 6px;
      height: 6px;
      background: var(--primary);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--primary);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    h1 {
      font-size: 2.75rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 0.5rem;
      color: #ffffff;
      font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    }
    h1 span { color: var(--primary); }
    .subtitle {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 1.75rem;
      line-height: 1.5;
    }
    .telemetry-card {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      margin-bottom: 1.75rem;
    }
    .telemetry-row {
      display: flex;
      justify-content: space-between;
      padding: 0.35rem 0;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
    }
    .telemetry-row:last-child { border-bottom: none; }
    .telemetry-label { color: var(--text-muted); }
    .telemetry-val { color: #fff; font-weight: bold; }
    .actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      padding: 0.85rem 1.4rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      cursor: pointer;
      flex: 1;
      min-width: 140px;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
      border: none;
      box-shadow: 0 4px 14px var(--primary-glow);
    }
    .btn-primary:hover {
      background: #c50500;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body>
  <div class="hud-box">
    <div class="status-badge">
      <span class="beacon"></span>
      PIT LANE ERROR // 404 NOT FOUND
    </div>
    <h1>SECTOR <span>OFF-TRACK</span></h1>
    <p class="subtitle">
      The telemetry coordinates you navigated to do not correspond to any active race track or checkpoint.
    </p>

    <div class="telemetry-card">
      <div class="telemetry-row">
        <span class="telemetry-label">TARGET PATH</span>
        <span class="telemetry-val"><?php echo $safeUri; ?></span>
      </div>
      <div class="telemetry-row">
        <span class="telemetry-label">TELEMETRY STATUS</span>
        <span class="telemetry-val" style="color: var(--primary);">DNF // OFF-GRID</span>
      </div>
      <div class="telemetry-row">
        <span class="telemetry-label">RECOMMENDED ACTION</span>
        <span class="telemetry-val">RETURN TO PIT LANE</span>
      </div>
    </div>

    <div class="actions">
      <a href="/" class="btn btn-primary">RETURN TO GRID</a>
      <a href="/events" class="btn btn-secondary">VIEW ALL EVENTS</a>
    </div>
  </div>
</body>
</html>
