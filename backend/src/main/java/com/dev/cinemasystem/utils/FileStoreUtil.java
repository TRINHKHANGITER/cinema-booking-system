package com.dev.cinemasystem.utils;


import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Objects;
public class FileStoreUtil {

    public static String saveKeepingNameWithSuffix(MultipartFile file, Path dir) {
        try {
            Files.createDirectories(dir);

            String original = Objects.requireNonNull(file.getOriginalFilename(), "file");
            original = Paths.get(original).getFileName().toString();

            // tách name + ext
            String base = original;
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot > 0) {
                base = original.substring(0, dot);
                ext = original.substring(dot);
            }

            Path target = dir.resolve(original).normalize();

            int i = 1;
            while (Files.exists(target)) {
                String candidate = base + "_" + i + ext;
                target = dir.resolve(candidate).normalize();
                i++;
            }

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target.getFileName().toString();
        } catch (IOException e) {
            throw new RuntimeException("Save file failed", e);
        }
    }

    public static String saveWithBaseNameOverwrite(MultipartFile file, Path dir, String baseName) {
        try {
            Files.createDirectories(dir);

            String ext = extractExtension(file.getOriginalFilename());
            String normalizedBaseName = sanitizeBaseName(baseName);
            String finalFileName = normalizedBaseName + ext;

            deleteByBaseName(dir, normalizedBaseName);

            Path target = dir.resolve(finalFileName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return finalFileName;
        } catch (IOException e) {
            throw new RuntimeException("Save file failed", e);
        }
    }

    public static void deleteIfExists(Path dir, String fileName) {
        if (fileName == null || fileName.isBlank()) return;
        try {
            Path p = dir.resolve(fileName).normalize();
            Files.deleteIfExists(p);
        } catch (IOException e) {
            throw new RuntimeException("Delete file failed", e);
        }
    }

    private static void deleteByBaseName(Path dir, String baseName) throws IOException {
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(dir, baseName + ".*")) {
            for (Path file : stream) {
                Files.deleteIfExists(file);
            }
        }
        Files.deleteIfExists(dir.resolve(baseName));
    }

    private static String sanitizeBaseName(String baseName) {
        if (baseName == null || baseName.isBlank()) {
            return "file";
        }
        return baseName.replaceAll("[^a-zA-Z0-9_-]", "_");
    }

    private static String extractExtension(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            return ".bin";
        }

        String fileName = Paths.get(originalName).getFileName().toString();
        int dot = fileName.lastIndexOf('.');
        if (dot <= 0 || dot == fileName.length() - 1) {
            return ".bin";
        }
        return fileName.substring(dot).toLowerCase(Locale.ROOT);
    }
}
