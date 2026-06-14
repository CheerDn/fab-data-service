package com.fab.datasvc.controller;

import com.fab.datasvc.dto.SensorLogDTO;
import com.fab.datasvc.dto.SensorSummaryDTO;
import com.fab.datasvc.service.SensorLogService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/equipment")
public class SensorLogController {

    private final SensorLogService sensorLogService;

    public SensorLogController(SensorLogService sensorLogService) {
        this.sensorLogService = sensorLogService;
    }

    @GetMapping("/{id}/metrics")
    public ResponseEntity<Page<SensorLogDTO>> getMetrics(
        @PathVariable Integer id,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "100") int size
    ) {
        Page<SensorLogDTO> result = sensorLogService.getMetrics(id, start, end, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/summary")
    public CompletableFuture<ResponseEntity<List<SensorSummaryDTO>>> getSummary(
        @PathVariable Integer id,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end
    ) {
        return sensorLogService.getSummaryAsync(id, start, end)
            .thenApply(ResponseEntity::ok);
    }
}
