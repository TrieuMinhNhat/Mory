package com.muicochay.mory.media.controller;

import com.muicochay.mory.media.service.CloudinarySignatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/media")
public class CloudinaryController {
    private final CloudinarySignatureService cloudinarySignatureService;

    @GetMapping("/signature")
    public Map<String, Object> getSignature(@RequestParam String folder) {
        return cloudinarySignatureService.generateSignature(folder);
    }
}
