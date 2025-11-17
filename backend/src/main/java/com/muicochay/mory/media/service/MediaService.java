package com.muicochay.mory.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class MediaService {
    private final Cloudinary cloudinary;

    public String upload(MultipartFile file) throws IOException {
        String resourceType = detectResourceType(file);

        Map<?, ?> result;
        if ("video".equals(resourceType)) {
            Map options = ObjectUtils.asMap(
                    "resource_type", "video"
            );
            result = cloudinary.uploader().upload(file.getBytes(), options);
        } else {
            result = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("resource_type", "image"));
        }

        return result.get("secure_url").toString();
    }

    public void delete(String url) throws IOException {
        String publicId = extractPublicIdFromUrl(url);
        String resourceType = detectResourceTypeFromUrl(url);

        Map options = ObjectUtils.asMap(
                "invalidate", true,
                "resource_type", resourceType
        );

        Map<?, ?> result = cloudinary.uploader().destroy(publicId, options);
        String deletionResult = (String) result.get("result");
        if ("ok".equals(deletionResult)) {
            log.info("Media deleted successfully: {}", publicId);
        } else if ("not found".equals(deletionResult)) {
            log.warn("Media not found, cannot delete: {}", publicId);
        } else {
            log.error("Failed to delete media: {}, result: {}", publicId, deletionResult);
        }
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        // URL: https://res.cloudinary.com/<cloud>/image/upload/q_auto/v1680000000/folder/subfolder/image.jpg?some=param
        // Extract /v{version}/
        String afterVersion = imageUrl.replaceFirst(".*?/v\\d+/", "");
        // Remove query params
        int qIdx = afterVersion.indexOf('?');
        if (qIdx != -1) {
            afterVersion = afterVersion.substring(0, qIdx);
        }
        // Remove (.jpg, .png, ...)
        int lastDot = afterVersion.lastIndexOf('.');
        if (lastDot == -1) {
            throw new IllegalArgumentException("Cannot extract public ID (no file extension): " + imageUrl);
        }
        return afterVersion.substring(0, lastDot);
    }

    private String detectResourceType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && contentType.startsWith("video/")) {
            return "video";
        }
        return "image";
    }

    private String detectResourceTypeFromUrl(String url) {
        if (url.contains("/video/")) return "video";
        return "image";
    }

}
