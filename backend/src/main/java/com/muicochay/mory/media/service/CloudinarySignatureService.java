package com.muicochay.mory.media.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinarySignatureService {
    private final Cloudinary cloudinary;

    public Map<String, Object> generateSignature(String folder) {
        long timestamp = System.currentTimeMillis() / 1000L;

        Map<String, Object> params = new HashMap<>();
        params.put("timestamp", timestamp);
        params.put("folder", folder);

        String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret);

        Map<String, Object> result = new HashMap<>();
        result.put("timestamp", timestamp);
        result.put("signature", signature);
        result.put("api_key", cloudinary.config.apiKey);
        result.put("cloud_name", cloudinary.config.cloudName);
        result.put("folder", folder);
        return result;
    }
}