package com.kaoqin.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AttendanceDTO {

    private Long id;
    private Long userId;
    private String userName;
    private LocalDate date;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String checkInType;
    private String checkOutType;
    private String checkInLocation;
    private String checkOutLocation;
    private String status;
    private String remark;
    private String workDuration;
}
