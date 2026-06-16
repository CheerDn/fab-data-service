package com.fab.datasvc.service;

import com.fab.datasvc.dto.EquipmentDTO;
import com.fab.datasvc.repository.EquipmentRepository;
import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.observation.annotation.Observed;
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

    @Observed(name = "EquipmentService.listAll")
    @Timed(value = "equipment.list", description = "Time to list all equipment", histogram = true)
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

    @Observed(name = "EquipmentService.findById")
    @Timed(value = "equipment.find_by_id", description = "Time to find equipment by id", histogram = true)
    public Optional<EquipmentDTO> findById(Integer id) {
        return equipmentRepository.findById(id).map(EquipmentDTO::from);
    }
}
