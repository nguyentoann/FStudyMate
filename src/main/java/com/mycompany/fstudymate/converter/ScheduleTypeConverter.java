package com.mycompany.fstudymate.converter;

import com.mycompany.fstudymate.model.PersonalSchedule.ScheduleType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
public class ScheduleTypeConverter implements AttributeConverter<ScheduleType, String> {
    
    private static final Logger logger = LoggerFactory.getLogger(ScheduleTypeConverter.class);

    @Override
    public String convertToDatabaseColumn(ScheduleType attribute) {
        if (attribute == null) {
            return "OTHER"; // Default value if null
        }
        return attribute.name();
    }

    @Override
    public ScheduleType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            logger.warn("Null or empty schedule type found in database, defaulting to OTHER");
            return ScheduleType.OTHER;
        }
        
        try {
            // Try case-insensitive conversion
            for (ScheduleType type : ScheduleType.values()) {
                if (type.name().equalsIgnoreCase(dbData)) {
                    return type;
                }
            }
            
            logger.warn("Unknown schedule type '{}' found in database, defaulting to OTHER", dbData);
            return ScheduleType.OTHER;
        } catch (Exception e) {
            logger.error("Error converting schedule type '{}': {}", dbData, e.getMessage());
            return ScheduleType.OTHER;
        }
    }
} 