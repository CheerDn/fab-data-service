package com.fab.datasvc.dto;

import com.fab.datasvc.model.SensorLog;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record SensorLogDTO(
    Long id,
    Integer equipmentId,
    OffsetDateTime recordedAt,
    BigDecimal temperature,
    BigDecimal pressure,
    BigDecimal throughput
) {
    public static SensorLogDTO from(SensorLog s) {
        return new SensorLogDTO(
            s.getId(),
            s.getEquipment().getId(),
            s.getRecordedAt(),
            s.getTemperature(),
            s.getPressure(),
            s.getThroughput()
        );
    }
}
