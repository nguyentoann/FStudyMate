package util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.Map;

/**
 * Utility class for JSON operations
 */
public class JSONUtil {
    private static final Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd").create();
    
    /**
     * Convert a JSON string to a Map
     * 
     * @param json JSON string to convert
     * @return Map containing the JSON data
     */
    public static Map<String, Object> fromJson(String json) {
        Type type = new TypeToken<Map<String, Object>>(){}.getType();
        return gson.fromJson(json, type);
    }
    
    /**
     * Convert an object to a JSON string
     * 
     * @param object Object to convert
     * @return JSON string representation of the object
     */
    public static String toJson(Object object) {
        return gson.toJson(object);
    }
} 