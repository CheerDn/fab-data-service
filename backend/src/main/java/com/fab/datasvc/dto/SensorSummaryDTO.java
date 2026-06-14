package com.fab.datasvc.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record SensorSummaryDTO(
    OffsetDateTime hour,
    BigDecimal avgTemperature,
    BigDecimal avgPressure,
    BigDecimal avgThroughput
) {}
