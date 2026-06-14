package com.fab.datasvc.dto;

import com.fab.datasvc.model.Equipment;

public record EquipmentDTO(
    Integer id,
    String name,
    String type,
    String location,
    String status
) {
    public static EquipmentDTO from(Equipment e) {
        return new EquipmentDTO(e.getId(), e.getName(), e.getType(), e.getLocation(), e.getStatus());
    }
}
