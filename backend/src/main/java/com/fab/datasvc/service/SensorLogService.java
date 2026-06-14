package com.fab.datasvc.service;

import com.fab.datasvc.dto.SensorLogDTO;
import com.fab.datasvc.dto.SensorSummaryDTO;
import com.fab.datasvc.repository.SensorLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class SensorLogService {

    private static final int MAX_PAGE_SIZE = 200;

    private final SensorLogRepository sensorLogRepository;

    public SensorLogService(SensorLogRepository sensorLogRepository) {
        this.sensorLogRepository = sensorLogRepository;
    }

    public Page<SensorLogDTO> getMetrics(Integer equipmentId, OffsetDateTime start, OffsetDateTime end, int page, int size) {
        int effectiveSize = Math.min(size, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, effectiveSize);
        return sensorLogRepository.findByEquipmentIdAndTimeRange(equipmentId, start, end, pageable)
            .map(SensorLogDTO::from);
    }

    @Async("asyncExecutor")
    public CompletableFuture<List<SensorSummaryDTO>> getSummaryAsync(Integer equipmentId, OffsetDateTime start, OffsetDateTime end) {
        List<SensorSummaryDTO> result = sensorLogRepository.findHourlySummary(equipmentId, start, end);
        return CompletableFuture.completedFuture(result);
    }
}
