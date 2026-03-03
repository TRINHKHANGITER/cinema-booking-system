package com.dev.cinemasystem.utils;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class ParseTime {

    public static LocalTime toLocalTime(String s) {
        if (s == null) return null;

        if (s.matches("^\\d{4}$")) {          // HHmm
            s = s.substring(0,2) + ":" + s.substring(2,4);
        } else if (s.matches("^\\d{6}$")) {   // HHmmss
            s = s.substring(0,2) + ":" + s.substring(2,4) + ":" + s.substring(4,6);
        }

        // chấp nhận HH:mm hoặc HH:mm:ss
        DateTimeFormatter f1 = DateTimeFormatter.ofPattern("HH:mm");
        DateTimeFormatter f2 = DateTimeFormatter.ofPattern("HH:mm:ss");
        try { return LocalTime.parse(s, f1); }
        catch (DateTimeParseException e) { return LocalTime.parse(s, f2); }
    }

}
