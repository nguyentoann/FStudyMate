package com.mycompany.vinmultiplechoice.util;

import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

/**
 * Utility class for parsing and handling device and browser information
 */
@Component
public class DeviceDataUtil {
    
    /**
     * Extract client IP address from the request
     */
    public String extractClientIp(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_CLUSTER_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_FORWARDED");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_VIA");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("REMOTE_ADDR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        // If multiple IPs are found, pick the first one (client IP)
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        
        return ipAddress;
    }
    
    /**
     * Extract browser information from User-Agent header
     */
    public Map<String, String> extractBrowserInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        
        String browserName = "Unknown";
        String browserVersion = "Unknown";
        
        // Simple pattern matching - in production use a more robust library
        if (userAgent != null) {
            // Edge
            if (userAgent.contains("Edg")) {
                browserName = "Edge";
                int edgIndex = userAgent.indexOf("Edg/");
                if (edgIndex > 0) {
                    browserVersion = parseVersion(userAgent, edgIndex + 4);
                }
            }
            // Chrome
            else if (userAgent.contains("Chrome")) {
                browserName = "Chrome";
                int chromeIndex = userAgent.indexOf("Chrome/");
                if (chromeIndex > 0) {
                    browserVersion = parseVersion(userAgent, chromeIndex + 7);
                }
            }
            // Firefox
            else if (userAgent.contains("Firefox")) {
                browserName = "Firefox";
                int firefoxIndex = userAgent.indexOf("Firefox/");
                if (firefoxIndex > 0) {
                    browserVersion = parseVersion(userAgent, firefoxIndex + 8);
                }
            }
            // Safari
            else if (userAgent.contains("Safari")) {
                browserName = "Safari";
                int safariIndex = userAgent.indexOf("Safari/");
                if (safariIndex > 0) {
                    browserVersion = parseVersion(userAgent, safariIndex + 7);
                }
            }
            // IE
            else if (userAgent.contains("MSIE")) {
                browserName = "Internet Explorer";
                int msieIndex = userAgent.indexOf("MSIE ");
                if (msieIndex > 0) {
                    browserVersion = parseVersion(userAgent, msieIndex + 5);
                }
            }
        }
        
        return Map.of("name", browserName, "version", browserVersion);
    }
    
    /**
     * Extract OS information from User-Agent header
     */
    public Map<String, String> extractOsInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        
        String osName = "Unknown";
        String osVersion = "Unknown";
        
        // Simple pattern matching - in production use a more robust library
        if (userAgent != null) {
            // Windows
            if (userAgent.contains("Windows")) {
                osName = "Windows";
                if (userAgent.contains("Windows NT 10.0")) osVersion = "10";
                else if (userAgent.contains("Windows NT 6.3")) osVersion = "8.1";
                else if (userAgent.contains("Windows NT 6.2")) osVersion = "8";
                else if (userAgent.contains("Windows NT 6.1")) osVersion = "7";
                else if (userAgent.contains("Windows NT 6.0")) osVersion = "Vista";
                else if (userAgent.contains("Windows NT 5.1") || userAgent.contains("Windows NT 5.2")) 
                    osVersion = "XP";
                else osVersion = "Unknown";
            }
            // Mac
            else if (userAgent.contains("Mac OS X")) {
                osName = "macOS";
                int macIndex = userAgent.indexOf("Mac OS X ");
                if (macIndex > 0) {
                    osVersion = parseVersion(userAgent, macIndex + 9);
                    osVersion = osVersion.replace("_", ".");
                }
            }
            // iOS
            else if (userAgent.contains("iPhone") || userAgent.contains("iPad") || userAgent.contains("iPod")) {
                osName = "iOS";
                int iosIndex = userAgent.indexOf("OS ");
                if (iosIndex > 0) {
                    osVersion = parseVersion(userAgent, iosIndex + 3);
                    osVersion = osVersion.replace("_", ".");
                }
            }
            // Android
            else if (userAgent.contains("Android")) {
                osName = "Android";
                int androidIndex = userAgent.indexOf("Android ");
                if (androidIndex > 0) {
                    osVersion = parseVersion(userAgent, androidIndex + 8);
                }
            }
            // Linux
            else if (userAgent.contains("Linux")) {
                osName = "Linux";
                osVersion = "";
            }
        }
        
        return Map.of("name", osName, "version", osVersion);
    }
    
    /**
     * Helper method to parse version numbers from User-Agent string
     */
    private String parseVersion(String userAgent, int startIndex) {
        StringBuilder version = new StringBuilder();
        int i = startIndex;
        
        // Extract digits and dots until a space or other character
        while (i < userAgent.length() && 
               (Character.isDigit(userAgent.charAt(i)) || 
                userAgent.charAt(i) == '.' || 
                userAgent.charAt(i) == '_')) {
            version.append(userAgent.charAt(i));
            i++;
        }
        
        return version.toString();
    }
    
    /**
     * Check if the request is from a mobile device
     */
    public boolean isMobileDevice(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) {
            return false;
        }
        
        // Simple mobile detection
        return userAgent.matches("(?i).*((android|bb\\d+|meego).+mobile|avantgo|bada\\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\\.(browser|link)|vodafone|wap|windows ce|xda|xiino).*") ||
               userAgent.substring(0, 4).matches("(?i)1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\\-(n|u)|c55\\/|capi|ccwa|cdm\\-|cell|chtm|cldc|cmd\\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\\-s|devi|dica|dmob|do(c|p)o|ds(12|\\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\\-|_)|g1 u|g560|gene|gf\\-5|g\\-mo|go(\\.w|od)|gr(ad|un)|haie|hcit|hd\\-(m|p|t)|hei\\-|hi(pt|ta)|hp( i|ip)|hs\\-c|ht(c(\\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\\-(20|go|ma)|i230|iac( |\\-|\\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\\/)|klon|kpt |kwc\\-|kyo(c|k)|le(no|xi)|lg( g|\\/(k|l|u)|50|54|\\-[a-w])|libw|lynx|m1\\-w|m3ga|m50\\/|ma(te|ui|xo)|mc(01|21|ca)|m\\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\\-2|po(ck|rt|se)|prox|psio|pt\\-g|qa\\-a|qc(07|12|21|32|60|\\-[2-7]|i\\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\\-|oo|p\\-)|sdk\\/|se(c(\\-|0|1)|47|mc|nd|ri)|sgh\\-|shar|sie(\\-|m)|sk\\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\\-|v\\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\\-|tdg\\-|tel(i|m)|tim\\-|t\\-mo|to(pl|sh)|ts(70|m\\-|m3|m5)|tx\\-9|up(\\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\\-|your|zeto|zte\\-");
    }
} 