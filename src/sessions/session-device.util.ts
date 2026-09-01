export interface DeviceInfo {
  deviceName: string | null;
  browserName: string | null;
  osName: string | null;
}

const BROWSER_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/Edg\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/Firefox\//, 'Firefox'],
  [/SamsungBrowser\//, 'Samsung Internet'],
  [/Chromium\//, 'Chromium'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
  [/MSIE |Trident\//, 'Internet Explorer'],
];

const OS_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/Windows NT 10/, 'Windows 10/11'],
  [/Windows NT 6\.3/, 'Windows 8.1'],
  [/Windows/, 'Windows'],
  [/Android/, 'Android'],
  [/iPhone/, 'iOS'],
  [/iPad/, 'iPadOS'],
  [/Mac OS X/, 'macOS'],
  [/CrOS/, 'Chrome OS'],
  [/Linux/, 'Linux'],
];

const DEVICE_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/Android/, 'Mobile / Android'],
  [/iPhone/, 'Mobile / iPhone'],
  [/iPad/, 'Tablette / iPad'],
  [/Windows Phone/, 'Mobile / Windows'],
];

function matchFirst(ua: string, patterns: ReadonlyArray<[RegExp, string]>): string | null {
  for (const [pattern, label] of patterns) {
    if (pattern.test(ua)) return label;
  }
  return null;
}

export function parseUserAgent(userAgent: string | null | undefined): DeviceInfo {
  const ua = (userAgent ?? '').slice(0, 400);

  if (!ua) {
    return { deviceName: null, browserName: 'Inconnu', osName: 'Inconnu' };
  }

  const browserName = matchFirst(ua, BROWSER_PATTERNS) ?? 'Inconnu';
  const osName = matchFirst(ua, OS_PATTERNS) ?? 'Inconnu';
  const deviceName = matchFirst(ua, DEVICE_PATTERNS) ?? 'Ordinateur';

  return { deviceName, browserName, osName };
}
