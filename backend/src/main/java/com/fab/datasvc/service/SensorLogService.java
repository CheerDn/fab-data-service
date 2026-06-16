package com.fab.datasvc.service;

import com.fab.datasvc.dto.SensorLogDTO;
import com.fab.datasvc.dto.SensorSummaryDTO;
import com.fab.datasvc.repository.SensorLogRepository;
import io.micrometer.core.annotation.Timed;
import io.micrometer.observation.annotation.Observed;
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

    @Observed(name = "SensorLogService.getMetrics")
    @Timed(value = "sensor.get_metrics", description = "Time to query sensor metrics", histogram = true)
    public Page<SensorLogDTO> getMetrics(Integer equipmentId, OffsetDateTime start, OffsetDateTime end, int page, int size) {
        int effectiveSize = Math.min(size, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, effectiveSize);
        return sensorLogRepository.findByEquipmentIdAndTimeRange(equipmentId, start, end, pageable)
            .map(SensorLogDTO::from);
    }

    @Observed(name = "SensorLogService.getSummaryAsync")
    @Timed(value = "sensor.get_summary_async", description = "Time to query sensor hourly summary", histogram = true)
    @Async("asyncExecutor")
    public CompletableFuture<List<SensorSummaryDTO>> getSummaryAsync(Integer equipmentId, OffsetDateTime start, OffsetDateTime end) {
        List<SensorSummaryDTO> result = sensorLogRepository.findHourlySummary(equipmentId, start, end);
        return CompletableFuture.completedFuture(result);
    }
}
