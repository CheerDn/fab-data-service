package com.fab.datasvc.service;

import com.fab.datasvc.dto.SensorLogDTO;
import com.fab.datasvc.dto.SensorSummaryDTO;
import com.fab.datasvc.repository.SensorLogRepository;
import io.micrometer.core.annotation.Timed;
import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
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
    private final ObservationRegistry observationRegistry;

    public SensorLogService(SensorLogRepository sensorLogRepository, ObservationRegistry observationRegistry) {
        this.sensorLogRepository = sensorLogRepository;
        this.observationRegistry = observationRegistry;
    }

    @Observed(name = "SensorLogService.getMetrics")
    @Timed(value = "sensor.get_metrics", description = "Time to query sensor metrics", histogram = true)
    public Page<SensorLogDTO> getMetrics(Integer equipmentId, OffsetDateTime start, OffsetDateTime end, int page, int size) {
        int effectiveSize = Math.min(size, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, effectiveSize);
        return Observation.createNotStarted("SensorLogRepository", observationRegistry)
            .lowCardinalityKeyValue("class", "SensorLogRepository")
            .lowCardinalityKeyValue("method", "findByEquipmentIdAndTimeRange")
            .observe(() -> sensorLogRepository.findByEquipmentIdAndTimeRange(equipmentId, start, end, pageable)
                .map(SensorLogDTO::from));
    }

    @Observed(name = "SensorLogService.getSummaryAsync")
    @Timed(value = "sensor.get_summary_async", description = "Time to query sensor hourly summary", histogram = true)
    @Async("asyncExecutor")
    public CompletableFuture<List<SensorSummaryDTO>> getSummaryAsync(Integer equipmentId, OffsetDateTime start, OffsetDateTime end) {
        List<SensorSummaryDTO> result = sensorLogRepository.findHourlySummary(equipmentId, start, end);
        return CompletableFuture.completedFuture(result);
    }
}
