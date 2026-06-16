package com.fab.datasvc.service;

import com.fab.datasvc.dto.EquipmentDTO;
import com.fab.datasvc.repository.EquipmentRepository;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final MeterRegistry meterRegistry;

    public EquipmentService(EquipmentRepository equipmentRepository, MeterRegistry meterRegistry) {
        this.equipmentRepository = equipmentRepository;
        this.meterRegistry = meterRegistry;
    }

    @Cacheable(value = "equipment-list", unless = "#result.isEmpty()")
    public List<EquipmentDTO> listAll() {
        meterRegistry.counter("cache.equipment.miss").increment();
        return equipmentRepository.findAll()
            .stream()
            .map(EquipmentDTO::from)
            .collect(Collectors.toList());
    }

    public void recordCacheHit() {
        meterRegistry.counter("cache.equipment.hit").increment();
    }

    public Optional<EquipmentDTO> findById(Integer id) {
        return equipmentRepository.findById(id).map(EquipmentDTO::from);
    }
}
