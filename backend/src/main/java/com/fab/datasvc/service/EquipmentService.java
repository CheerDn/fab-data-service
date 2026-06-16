package com.fab.datasvc.service;

import com.fab.datasvc.dto.EquipmentDTO;
import com.fab.datasvc.repository.EquipmentRepository;
import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.MeterRegistry;
import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;
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

    @WithSpan("EquipmentService.listAll")
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

    @WithSpan("EquipmentService.findById")
    @Timed(value = "equipment.find_by_id", description = "Time to find equipment by id", histogram = true)
    public Optional<EquipmentDTO> findById(@SpanAttribute("equipment.id") Integer id) {
        return equipmentRepository.findById(id).map(EquipmentDTO::from);
    }
}
