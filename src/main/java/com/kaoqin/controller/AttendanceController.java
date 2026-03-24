package com.kaoqin.controller;

import com.kaoqin.common.Result;
import com.kaoqin.entity.Attendance;
import com.kaoqin.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/clock-in")
    public Result<Attendance> clockIn(@RequestParam Long userId,
                                      @RequestParam(required = false) String clockInType) {
        try {
            Attendance attendance = attendanceService.clockIn(userId, clockInType);
            return Result.success("签到成功", attendance);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/clock-out")
    public Result<Attendance> clockOut(@RequestParam Long userId) {
        try {
            Attendance attendance = attendanceService.clockOut(userId);
            return Result.success("签退成功", attendance);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/today")
    public Result<Attendance> getTodayAttendance(@RequestParam Long userId) {
        return attendanceService.getTodayAttendance(userId)
                .map(Result::success)
                .orElse(Result.success("今日暂无打卡记录", null));
    }

    @GetMapping("/user/{userId}")
    public Result<List<Attendance>> getUserAttendance(@PathVariable Long userId) {
        List<Attendance> attendances = attendanceService.findByUserId(userId);
        return Result.success(attendances);
    }

    @GetMapping("/user/{userId}/date-range")
    public Result<List<Attendance>> getUserAttendanceByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Attendance> attendances = attendanceService.findByUserIdAndDateRange(userId, start, end);
        return Result.success(attendances);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<Attendance>> getAllAttendance() {
        List<Attendance> attendances = attendanceService.findAll();
        return Result.success(attendances);
    }
}
