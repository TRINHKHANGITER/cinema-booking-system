package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.comboDTO.ComboResponse;
import com.dev.cinemasystem.entity.Combo;
import com.dev.cinemasystem.mapper.ComboMapper;
import com.dev.cinemasystem.repository.ComboRepository;
import com.dev.cinemasystem.enums.ComboStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ComboService {
    ComboRepository comboRepository;
    ComboMapper comboMapper;

    public ComboResponse getComboById(int comboId) {
        Combo combo =  comboRepository.findById(comboId)
                .orElseThrow(() -> new RuntimeException("Combo not exists!"));

        return comboMapper.toComboResponse(combo);
    }

    public List<ComboResponse> getCombos(ComboStatus status) {
        var combos = status == null
                ? comboRepository.findAll()
                : comboRepository.findAllByStatus(status);

        return combos.stream().map(combo -> comboMapper.toComboResponse(combo)).toList();
    }
}
