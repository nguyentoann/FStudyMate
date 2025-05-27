/**
 * Device Detector Utility
 * Detects browser, OS, and device information on the client-side
 */
class DeviceDetector {
    /**
     * Get information about the current device and browser
     */
    getDeviceInfo() {
        return {
            browser: this.getBrowser(),
            os: this.getOS(),
            screen: this.getScreenInfo(),
            isMobile: this.isMobileDevice(),
            deviceFingerprint: this.generateDeviceFingerprint()
        };
    }
    
    /**
     * Detect browser information
     */
    getBrowser() {
        const userAgent = navigator.userAgent;
        let browserName = "Unknown";
        let version = "Unknown";
        
        // Edge
        if (userAgent.match(/Edg/i)) {
            browserName = "Edge";
            version = this.extractVersion(userAgent, "Edg");
        }
        // Chrome
        else if (userAgent.match(/Chrome/i)) {
            browserName = "Chrome";
            version = this.extractVersion(userAgent, "Chrome");
        }
        // Firefox
        else if (userAgent.match(/Firefox/i)) {
            browserName = "Firefox";
            version = this.extractVersion(userAgent, "Firefox");
        }
        // Safari
        else if (userAgent.match(/Safari/i)) {
            browserName = "Safari";
            version = this.extractVersion(userAgent, "Safari");
        }
        // IE
        else if (userAgent.match(/MSIE/i) || userAgent.match(/Trident/i)) {
            browserName = "Internet Explorer";
            version = this.extractIEVersion(userAgent);
        }
        
        return { name: browserName, version: version };
    }
    
    /**
     * Extract version number from user agent string
     */
    extractVersion(userAgent, browser) {
        const regex = new RegExp(`${browser}\\/([\\d\\.]+)`);
        const match = userAgent.match(regex);
        
        return match ? match[1] : "Unknown";
    }
    
    /**
     * Handle special case for Internet Explorer version
     */
    extractIEVersion(userAgent) {
        const msie = userAgent.indexOf("MSIE ");
        if (msie > 0) {
            return parseInt(userAgent.substring(msie + 5, userAgent.indexOf(".", msie)), 10).toString();
        }
        
        const trident = userAgent.indexOf("Trident/");
        if (trident > 0) {
            const rv = userAgent.indexOf("rv:");
            return parseInt(userAgent.substring(rv + 3, userAgent.indexOf(".", rv)), 10).toString();
        }
        
        return "Unknown";
    }
    
    /**
     * Detect operating system
     */
    getOS() {
        const userAgent = navigator.userAgent;
        let osName = "Unknown";
        let version = "";
        
        // Windows
        if (userAgent.match(/Windows NT/i)) {
            osName = "Windows";
            if (userAgent.match(/Windows NT 10\.0/i)) version = "10";
            else if (userAgent.match(/Windows NT 6\.3/i)) version = "8.1";
            else if (userAgent.match(/Windows NT 6\.2/i)) version = "8";
            else if (userAgent.match(/Windows NT 6\.1/i)) version = "7";
            else if (userAgent.match(/Windows NT 6\.0/i)) version = "Vista";
            else if (userAgent.match(/Windows NT 5\.1/i) || userAgent.match(/Windows NT 5\.2/i)) version = "XP";
            else version = "Unknown";
        }
        // Mac
        else if (userAgent.match(/Macintosh|Mac OS X/i)) {
            osName = "macOS";
            const match = userAgent.match(/Mac OS X ([0-9._]+)/i);
            version = match ? match[1].replace(/_/g, ".") : "Unknown";
        }
        // iOS
        else if (userAgent.match(/iPhone|iPad|iPod/i)) {
            osName = "iOS";
            const match = userAgent.match(/OS ([0-9_]+)/i);
            version = match ? match[1].replace(/_/g, ".") : "Unknown";
        }
        // Android
        else if (userAgent.match(/Android/i)) {
            osName = "Android";
            const match = userAgent.match(/Android ([0-9.]+)/i);
            version = match ? match[1] : "Unknown";
        }
        // Linux
        else if (userAgent.match(/Linux/i)) {
            osName = "Linux";
        }
        
        return { name: osName, version: version };
    }
    
    /**
     * Get screen/display information
     */
    getScreenInfo() {
        return {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
            orientation: window.screen.orientation ? window.screen.orientation.type : "Unknown"
        };
    }
    
    /**
     * Check if the device is mobile
     */
    isMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
    }
    
    /**
     * Generate a simple device fingerprint
     * NOTE: This is a basic implementation. For production, consider a more robust solution like Fingerprint2.js
     */
    generateDeviceFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            new Date().getTimezoneOffset(),
            navigator.platform,
            navigator.plugins.length,
            window.screen.colorDepth,
            window.screen.width + 'x' + window.screen.height
        ];
        
        // Create a simple hash of the components
        const fingerprint = components.join('###');
        
        // Convert to a simple hash
        return this.simpleHash(fingerprint);
    }
    
    /**
     * Simple string hashing function
     */
    simpleHash(str) {
        let hash = 0;
        
        if (str.length === 0) return hash;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return Math.abs(hash).toString(36);
    }
}

// Create singleton instance
const deviceDetector = new DeviceDetector();

export default deviceDetector; 