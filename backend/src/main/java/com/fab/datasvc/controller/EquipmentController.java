package com.fab.datasvc.controller;

import com.fab.datasvc.dto.EquipmentDTO;
import com.fab.datasvc.service.EquipmentService;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.SimpleKey;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final CacheManager cacheManager;

    public EquipmentController(EquipmentService equipmentService, CacheManager cacheManager) {
        this.equipmentService = equipmentService;
        this.cacheManager = cacheManager;
    }

    @GetMapping
    public List<EquipmentDTO> listAll() {
        Cache cache = cacheManager.getCache("equipment-list");
        boolean isHit = cache != null && cache.get(Objects.requireNonNull(SimpleKey.EMPTY)) != null;
        List<EquipmentDTO> result = equipmentService.listAll();
        if (isHit) equipmentService.recordCacheHit();
        return result;
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentDTO> getById(@PathVariable Integer id) {
        return equipmentService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
