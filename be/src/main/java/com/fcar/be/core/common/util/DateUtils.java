// # Tiện ích format, parse thời gian
package com.fcar.be.core.common.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtils {
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern(DATE_TIME_FORMAT);

    public static String format(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(FORMATTER);
    }

    public static LocalDateTime parse(String dateStr) {
        return dateStr == null ? null : LocalDateTime.parse(dateStr, FORMATTER);
    }
}
