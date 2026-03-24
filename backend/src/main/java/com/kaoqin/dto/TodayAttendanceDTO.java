package com.kaoqin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TodayAttendanceDTO {

    private String status;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String workDuration;
    private Boolean canCheckIn;
    private Boolean canCheckOut;
}
