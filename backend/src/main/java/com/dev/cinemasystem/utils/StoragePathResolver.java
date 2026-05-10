package com.dev.cinemasystem.utils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public final class StoragePathResolver {

    private StoragePathResolver() {
    }

    public static Path resolveToAbsolutePath(String configuredDir) {
        Path configuredPath = Paths.get(configuredDir).normalize();
        if (configuredPath.isAbsolute()) {
            return configuredPath;
        }

        Path workingDir = Paths.get("").toAbsolutePath().normalize();
        Path directPath = workingDir.resolve(configuredPath).normalize();
        if (Files.exists(directPath)) {
            return directPath;
        }

        Path backendRelativePath = workingDir.resolve("backend").resolve(configuredPath).normalize();
        if (Files.exists(backendRelativePath)) {
            return backendRelativePath;
        }

        return directPath;
    }
}
