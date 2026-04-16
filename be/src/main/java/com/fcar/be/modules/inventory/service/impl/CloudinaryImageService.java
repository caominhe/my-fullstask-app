package com.fcar.be.modules.inventory.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryImageService {
    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.folder:fcar}")
    private String cloudinaryFolder;

    public String uploadCarImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.CAR_IMAGE_UPLOAD_FAILED);
        }
        try {
            Map<?, ?> uploadResult = cloudinary
                    .uploader()
                    .upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder",
                                    cloudinaryFolder + "/cars",
                                    "resource_type",
                                    "image",
                                    "overwrite",
                                    true,
                                    "unique_filename",
                                    true));
            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new AppException(ErrorCode.CAR_IMAGE_UPLOAD_FAILED);
            }
            return secureUrl.toString();
        } catch (IOException ex) {
            throw new AppException(ErrorCode.CAR_IMAGE_UPLOAD_FAILED);
        }
    }

    public List<String> uploadCarImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new AppException(ErrorCode.CAR_IMAGE_UPLOAD_FAILED);
        }
        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            uploadedUrls.add(uploadCarImage(file));
        }
        if (uploadedUrls.isEmpty()) {
            throw new AppException(ErrorCode.CAR_IMAGE_UPLOAD_FAILED);
        }
        return uploadedUrls;
    }

    /**
     * Thư mục: {@code {app.cloudinary.folder}/payment/{contractNo}/{receiptId}}.
     */
    public String uploadPaymentProof(MultipartFile file, String contractNo, Long receiptId) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.CAR_IMAGE_UPLOAD_FAILED);
        }
        String safeContract = contractNo == null ? "unknown" : contractNo.replaceAll("[^a-zA-Z0-9._-]", "_");
        String folder = cloudinaryFolder + "/payment/" + safeContract + "/" + receiptId;
        try {
            Map<?, ?> uploadResult = cloudinary
                    .uploader()
                    .upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder",
                                    folder,
                                    "resource_type",
                                    "image",
                                    "overwrite",
                                    false,
                                    "unique_filename",
                                    true));
            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new AppException(ErrorCode.CAR_IMAGE_UPLOAD_FAILED);
            }
            return secureUrl.toString();
        } catch (IOException ex) {
            throw new AppException(ErrorCode.CAR_IMAGE_UPLOAD_FAILED);
        }
    }
}
