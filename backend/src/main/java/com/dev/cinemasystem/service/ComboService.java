package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.comboDTO.ComboCreationRequest;
import com.dev.cinemasystem.dto.comboDTO.ComboResponse;
import com.dev.cinemasystem.dto.comboDTO.ComboUpdateRequest;
import com.dev.cinemasystem.entity.Combo;
import com.dev.cinemasystem.enums.ComboStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.ComboMapper;
import com.dev.cinemasystem.repository.ComboRepository;
import com.dev.cinemasystem.repository.OrderComboRepository;
import com.dev.cinemasystem.utils.FileStoreUtil;
import com.dev.cinemasystem.utils.StoragePathResolver;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ComboService {
    ComboRepository comboRepository;
    ComboMapper comboMapper;
    OrderComboRepository orderComboRepository;

    @Value("${storage.image-combo-dir}")
    @NonFinal
    String imageComboDir;

    public ComboResponse getComboById(Integer comboId) {
        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> {
                    log.error("Combo with id {} not found", comboId);
                    return new AppException(ErrorCode.COMBO_NOT_FOUND);
                });

        return comboMapper.toComboResponse(combo);
    }

    public List<ComboResponse> getCombos(ComboStatus status) {
        List<Combo> combos = status == null
                ? comboRepository.findAll()
                : comboRepository.findAllByStatus(status);

        return comboMapper.toComboResponseList(combos);
    }

    public PagingDto<ComboResponse> filterCombos(
            Integer comboId,
            String name,
            String status,
            Integer page,
            Integer size
    ) {
        validatePageAndSize(page, size);

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<Combo> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (comboId != null) {
                predicates.add(builder.equal(root.get("comboId"), comboId));
            }

            if (name != null && !name.isBlank()) {
                String keyword = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(root.get("comboName")), keyword));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(builder.equal(root.get("status"), parseComboStatus(status)));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Combo> comboPage = comboRepository.findAll(specification, pageable);
        List<ComboResponse> comboResponses = comboMapper.toComboResponseList(comboPage.getContent());

        return PagingDto.<ComboResponse>builder()
                .items(comboResponses)
                .currentPage(comboPage.getNumber() + 1)
                .pageSize(comboPage.getSize())
                .totalItems(comboPage.getTotalElements())
                .totalPages(comboPage.getTotalPages())
                .build();
    }

    public ComboResponse createCombo(ComboCreationRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String normalizedName = normalizeName(request.getComboName());
        if (comboRepository.existsByComboNameIgnoreCase(normalizedName)) {
            throw new AppException(ErrorCode.COMBO_NAME_EXISTS);
        }

        Combo combo = comboMapper.toComboFromCreationRequest(request);
        combo.setComboName(normalizedName);
        combo.setDescription(normalizeDescription(request.getDescription()));
        combo.setStatus(request.getStatus() != null ? request.getStatus() : ComboStatus.AVAILABLE);

        Combo savedCombo = comboRepository.save(combo);

        MultipartFile image = request.getImage();
        if (image != null && !image.isEmpty()) {
            String fileName = saveComboImage(savedCombo.getComboId(), image);
            savedCombo.setImage(fileName);
            savedCombo = comboRepository.save(savedCombo);
        }

        return comboMapper.toComboResponse(savedCombo);
    }

    public ComboResponse updateCombo(Integer comboId, ComboUpdateRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> {
                    log.error("Combo with id {} not found", comboId);
                    return new AppException(ErrorCode.COMBO_NOT_FOUND);
                });

        if (request.getComboName() != null) {
            String normalizedName = normalizeName(request.getComboName());
            if (comboRepository.existsByComboNameIgnoreCaseAndComboIdNot(normalizedName, comboId)) {
                throw new AppException(ErrorCode.COMBO_NAME_EXISTS);
            }
            request.setComboName(normalizedName);
        }

        if (request.getDescription() != null) {
            request.setDescription(normalizeDescription(request.getDescription()));
        }

        comboMapper.updateComboInfo(combo, request);
        Combo savedCombo = comboRepository.save(combo);

        MultipartFile image = request.getImage();
        if (image != null && !image.isEmpty()) {
            String fileName = saveComboImage(savedCombo.getComboId(), image);
            savedCombo.setImage(fileName);
            savedCombo = comboRepository.save(savedCombo);
        }

        return comboMapper.toComboResponse(savedCombo);
    }

    public boolean deleteCombo(Integer comboId) {
        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> {
                    log.error("Combo with id {} not found", comboId);
                    return new AppException(ErrorCode.COMBO_NOT_FOUND);
                });

        if (orderComboRepository.existsByCombo_ComboId(comboId)) {
            throw new AppException(ErrorCode.COMBO_HAS_ACTIVE_ORDER_COMBOS);
        }

        combo.setStatus(ComboStatus.DISCONTINUED);
        comboRepository.save(combo);
        return true;
    }

    public List<String> getAllComboStatuses() {
        return Arrays.stream(ComboStatus.values())
                .map(Enum::name)
                .toList();
    }

    private String saveComboImage(Integer comboId, MultipartFile image) {
        try {
            Path imageDir = StoragePathResolver.resolveToAbsolutePath(imageComboDir);
            return FileStoreUtil.saveWithBaseNameOverwrite(image, imageDir, String.valueOf(comboId));
        } catch (RuntimeException exception) {
            log.error("Failed to save image for combo id {}", comboId, exception);
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    private ComboStatus parseComboStatus(String value) {
        try {
            return ComboStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception exception) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void validatePageAndSize(Integer page, Integer size) {
        if (page == null || page < 1) {
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size == null || size < 1 || size > 100) {
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
    }

    private String normalizeName(String value) {
        if (value == null || value.isBlank()) {
            throw new AppException(ErrorCode.COMBO_NAME_BLANK);
        }
        return value.trim();
    }

    private String normalizeDescription(String value) {
        if (value == null || value.isBlank()) {
            throw new AppException(ErrorCode.DESCRIPTION_BLANK);
        }
        return value.trim();
    }
}


