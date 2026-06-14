package com.fab.datasvc.repository;

import com.fab.datasvc.dto.SensorSummaryDTO;
import com.fab.datasvc.model.SensorLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface SensorLogRepository extends JpaRepository<SensorLog, Long> {

    @Query("SELECT s FROM SensorLog s WHERE s.equipment.id = :equipmentId " +
           "AND s.recordedAt BETWEEN :start AND :end ORDER BY s.recordedAt DESC")
    Page<SensorLog> findByEquipmentIdAndTimeRange(
        @Param("equipmentId") Integer equipmentId,
        @Param("start") OffsetDateTime start,
        @Param("end") OffsetDateTime end,
        Pageable pageable
    );

    @Query("""
        SELECT new com.fab.datasvc.dto.SensorSummaryDTO(
            CAST(DATE_TRUNC('hour', s.recordedAt) AS java.time.OffsetDateTime),
            CAST(AVG(s.temperature) AS java.math.BigDecimal),
            CAST(AVG(s.pressure) AS java.math.BigDecimal),
            CAST(AVG(s.throughput) AS java.math.BigDecimal)
        )
        FROM SensorLog s
        WHERE s.equipment.id = :equipmentId
          AND s.recordedAt BETWEEN :start AND :end
        GROUP BY DATE_TRUNC('hour', s.recordedAt)
        ORDER BY DATE_TRUNC('hour', s.recordedAt)
        """)
    List<SensorSummaryDTO> findHourlySummary(
        @Param("equipmentId") Integer equipmentId,
        @Param("start") OffsetDateTime start,
        @Param("end") OffsetDateTime end
    );

    // DEMO: intentionally unbounded — used to show EXPLAIN ANALYZE before/after
    @Query("SELECT s FROM SensorLog s WHERE s.equipment.id = :equipmentId ORDER BY s.recordedAt DESC")
    List<SensorLog> findAllByEquipmentIdNoPaging(@Param("equipmentId") Integer equipmentId);
}
