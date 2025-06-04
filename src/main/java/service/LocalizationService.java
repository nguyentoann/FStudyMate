package service;

import java.util.HashMap;
import java.util.Map;
import java.util.MissingResourceException;
import java.util.ResourceBundle;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.stereotype.Service;

@Service
public class LocalizationService {
    
    private static final Logger LOGGER = Logger.getLogger(LocalizationService.class.getName());
    
    private static final Locale VIETNAMESE = new Locale("vi", "VN");
    private static final Locale ENGLISH = new Locale("en", "US");
    
    private final Map<String, ResourceBundle> bundleCache = new HashMap<>();
    
    /**
     * Lấy chuỗi dịch theo ngôn ngữ
     * @param key Khóa của chuỗi cần dịch
     * @param locale Mã ngôn ngữ (vi_VN hoặc en_US)
     * @return Chuỗi đã dịch
     */
    public String getMessage(String key, Locale locale) {
        try {
            ResourceBundle bundle = getResourceBundle(locale);
            if (bundle.containsKey(key)) {
                return bundle.getString(key);
            } else {
                // Nếu không tìm thấy khóa trong ngôn ngữ đã chọn, sử dụng tiếng Anh mặc định
                bundle = getResourceBundle(ENGLISH);
                return bundle.containsKey(key) ? bundle.getString(key) : key;
            }
        } catch (MissingResourceException e) {
            LOGGER.log(Level.WARNING, "Cannot find message for key: " + key, e);
            return key;
        }
    }
    
    /**
     * Lấy chuỗi tiếng Việt
     * @param key Khóa của chuỗi cần dịch
     * @return Chuỗi tiếng Việt
     */
    public String getVietnameseMessage(String key) {
        return getMessage(key, VIETNAMESE);
    }
    
    /**
     * Lấy chuỗi tiếng Anh
     * @param key Khóa của chuỗi cần dịch
     * @return Chuỗi tiếng Anh
     */
    public String getEnglishMessage(String key) {
        return getMessage(key, ENGLISH);
    }
    
    /**
     * Lấy chuỗi theo ngôn ngữ với tham số thay thế
     * @param key Khóa của chuỗi cần dịch
     * @param locale Mã ngôn ngữ
     * @param args Các tham số để thay thế vào chuỗi
     * @return Chuỗi đã dịch với tham số đã thay thế
     */
    public String getMessage(String key, Locale locale, Object... args) {
        String message = getMessage(key, locale);
        if (args != null && args.length > 0) {
            return String.format(message, args);
        }
        return message;
    }
    
    /**
     * Lấy chuỗi tiếng Việt với tham số thay thế
     * @param key Khóa của chuỗi cần dịch
     * @param args Các tham số để thay thế vào chuỗi
     * @return Chuỗi tiếng Việt với tham số đã thay thế
     */
    public String getVietnameseMessage(String key, Object... args) {
        return getMessage(key, VIETNAMESE, args);
    }
    
    /**
     * Lấy chuỗi tiếng Anh với tham số thay thế
     * @param key Khóa của chuỗi cần dịch
     * @param args Các tham số để thay thế vào chuỗi
     * @return Chuỗi tiếng Anh với tham số đã thay thế
     */
    public String getEnglishMessage(String key, Object... args) {
        return getMessage(key, ENGLISH, args);
    }
    
    private ResourceBundle getResourceBundle(Locale locale) {
        String bundleName = "messages";
        String cacheKey = bundleName + "_" + locale.toString();
        
        if (!bundleCache.containsKey(cacheKey)) {
            ResourceBundle bundle = ResourceBundle.getBundle(bundleName, locale);
            bundleCache.put(cacheKey, bundle);
            return bundle;
        }
        
        return bundleCache.get(cacheKey);
    }
} 