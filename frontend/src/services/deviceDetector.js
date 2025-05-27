// Device detection utility to identify user's browser and operating system

/**
 * Get detailed device information
 * @returns {Object} Device info including browser, OS, and screen details
 */
export const getDeviceInfo = () => {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  
  // Detect browser
  const browser = detectBrowser(userAgent);
  
  // Detect operating system
  const os = detectOS(userAgent, platform);
  
  // Check if mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Create device string (for display)
  const deviceString = `${browser.name} ${browser.version} / ${os.name} ${os.version}`;
  
  return {
    browser: browser,
    os: os,
    screen: {
      width: screenWidth,
      height: screenHeight
    },
    isMobile,
    deviceString,
    userAgent,
    deviceFingerprint: generateDeviceFingerprint(userAgent, screenWidth, screenHeight)
  };
};

/**
 * Detect browser name and version
 */
const detectBrowser = (userAgent) => {
  // Edge (Chromium based)
  const edgChromium = userAgent.match(/Edg\/([0-9]+)/);
  if (edgChromium) {
    return { name: 'Edge', version: edgChromium[1] };
  }
  
  // Chrome
  const chrome = userAgent.match(/(Chrome|CriOS)\/([0-9]+)/);
  if (chrome) {
    return { name: 'Chrome', version: chrome[2] };
  }
  
  // Firefox
  const firefox = userAgent.match(/Firefox\/([0-9]+)/);
  if (firefox) {
    return { name: 'Firefox', version: firefox[1] };
  }
  
  // Safari
  const safari = userAgent.match(/Version\/([0-9]+).*Safari/);
  if (safari) {
    return { name: 'Safari', version: safari[1] };
  }
  
  // IE
  const msie = userAgent.match(/MSIE ([0-9]+)/);
  if (msie) {
    return { name: 'Internet Explorer', version: msie[1] };
  }
  
  // Opera
  const opera = userAgent.match(/OPR\/([0-9]+)/);
  if (opera) {
    return { name: 'Opera', version: opera[1] };
  }
  
  // Default
  return { name: 'Unknown', version: '0' };
};

/**
 * Detect operating system name and version
 */
const detectOS = (userAgent, platform) => {
  // Windows
  if (userAgent.indexOf('Windows NT') !== -1) {
    const windowsVersion = userAgent.match(/Windows NT ([0-9]+\.[0-9]+)/);
    let version = windowsVersion ? windowsVersion[1] : '';
    
    // Map NT version to Windows release name
    switch (version) {
      case '10.0': 
        version = '10'; 
        break;
      case '6.3': 
        version = '8.1'; 
        break;
      case '6.2': 
        version = '8'; 
        break;
      case '6.1': 
        version = '7'; 
        break;
      case '6.0': 
        version = 'Vista'; 
        break;
      case '5.2':
      case '5.1': 
        version = 'XP'; 
        break;
      default: 
        version = version;
    }
    
    return { name: 'Windows', version };
  }
  
  // macOS
  if (userAgent.indexOf('Macintosh') !== -1 || userAgent.indexOf('Mac OS X') !== -1) {
    const macVersion = userAgent.match(/Mac OS X ([0-9_]+)/);
    let version = macVersion ? macVersion[1].replace(/_/g, '.') : '';
    
    // Extract just major.minor versions
    if (version) {
      const parts = version.split('.');
      if (parts.length >= 2) {
        version = parts[0] + '.' + parts[1];
      }
    }
    
    return { name: 'macOS', version };
  }
  
  // iOS
  if (/(iPhone|iPad|iPod)/.test(userAgent)) {
    const iosVersion = userAgent.match(/OS (\d+)_(\d+)/);
    const version = iosVersion ? `${iosVersion[1]}.${iosVersion[2]}` : '';
    return { name: 'iOS', version };
  }
  
  // Android
  if (userAgent.indexOf('Android') !== -1) {
    const androidVersion = userAgent.match(/Android ([0-9\.]+)/);
    const version = androidVersion ? androidVersion[1] : '';
    return { name: 'Android', version };
  }
  
  // Linux
  if (userAgent.indexOf('Linux') !== -1 || platform.indexOf('Linux') !== -1) {
    return { name: 'Linux', version: '' };
  }
  
  // Default
  return { name: 'Unknown', version: '' };
};

/**
 * Generate a pseudo device fingerprint
 * Note: For a real app, consider using a proper fingerprinting library
 */
const generateDeviceFingerprint = (userAgent, screenWidth, screenHeight) => {
  const components = [
    userAgent,
    screenWidth,
    screenHeight,
    window.navigator.language,
    new Date().getTimezoneOffset()
  ];
  
  // Create a simple hash
  const data = components.join('|');
  let hash = 0;
  
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}; 