package com.dev.cinemasystem.utils;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

public final class VnPayUtil {
    private static final Pattern NON_ASCII = Pattern.compile("^\\p{ASCII}");

    // chặn tạo đối tượng VnPayUtil
    private VnPayUtil() {}

    public static String hmacSha512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            // “nạp” khóa bí mật vào bộ tạo chữ ký

            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            // doFinal():
            //     Tính toán HMAC
            //     Trả về kết quả dạng byte[]
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
                // %x → chuyển số sang hex (cơ số 16)
                // 02 → đảm bảo luôn có 2 ký tự
            }

            return hash.toString();

        } catch (Exception e) {
            throw new IllegalStateException("Không tạo được chữ ký HMAC SHA512", e);
        }
    }

    public static String buildQueryData(Map<String, String> fields, boolean encodeValue) {
        List<String> names = new ArrayList<>(fields.keySet());
        Collections.sort(names);

        boolean first = true;
        StringBuilder builder = new StringBuilder();
        for (String name : names) {
            String value = fields.get(name);
            if (value == null || value.isEmpty()) {
                continue;
            }

            if (!first) {
                builder.append('&');
            }
            builder.append(name).append("=");
            builder.append(encodeValue ? urlEncode(value) : value);
            first = false;
        }

        return builder.toString();
    }

    public static String urlEncode(String value) {
        // StandardCharsets.US_ASCII. Cái này khá chặt, vì chỉ hỗ trợ ký tự ASCII
        // Biến chuỗi thành dạng:
        // "Dien thoai A1" → "Dien+thoai+A1" hoặc: ":" → %3A
        return URLEncoder.encode(value, StandardCharsets.US_ASCII);
    }

    public static String sanitizeOrderInfo(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        // Normalizer.Form.NFD = tách ký tự có dấu thành:
        // chữ gốc + dấu riêng
        // Ví dụ: "á" → "a" + dấu sắc
        normalized = normalized.replace("Đ", "D").replace("đ", "d");

        String noAccent = NON_ASCII.matcher(normalized).replaceAll("");
        return noAccent.replaceAll("[^a-zA-Z0-9\\s._:-]", "").trim();
    }

}
