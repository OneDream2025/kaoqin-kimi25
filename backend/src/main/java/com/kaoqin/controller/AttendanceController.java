package com.kaoqin.controller;

import com.kaoqin.common.ApiResponse;
import com.kaoqin.dto.AttendanceDTO;
import com.kaoqin.dto.CheckInRequest;
import com.kaoqin.dto.TodayAttendanceDTO;
import com.kaoqin.security.UserPrincipal;
import com.kaoqin.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@Tag(name = "考勤管理", description = "打卡签到、考勤记录查询")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/today")
    @Operation(summary = "获取今日考勤状态", description = "获取当前用户今天的考勤状态，包括上下班打卡时间和工作时长")
    public ApiResponse<TodayAttendanceDTO> getTodayAttendance(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        TodayAttendanceDTO todayAttendance = attendanceService.getTodayAttendance(currentUser.getId());
        return ApiResponse.success(todayAttendance);
    }

    @PostMapping("/checkin")
    @Operation(summary = "打卡", description = "上班或下班打卡")
    public ApiResponse<AttendanceDTO> checkIn(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "打卡请求") @Valid @RequestBody CheckInRequest request) {
        AttendanceDTO attendance = attendanceService.checkIn(currentUser.getId(), request);
        return ApiResponse.success("打卡成功", attendance);
    }

    @GetMapping("/history")
    @Operation(summary = "获取考勤历史", description = "查询当前用户的考勤历史记录")
    public ApiResponse<List<AttendanceDTO>> getAttendanceHistory(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "开始日期(yyyy-MM-dd)") @RequestParam(required = false) String startDate,
            @Parameter(description = "结束日期(yyyy-MM-dd)") @RequestParam(required = false) String endDate) {
        List<AttendanceDTO> history = attendanceService.getAttendanceHistory(currentUser.getId(), startDate, endDate);
        return ApiResponse.success(history);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "获取指定用户考勤", description = "查询指定用户的考勤记录，管理员可查看所有用户")
    public ApiResponse<List<AttendanceDTO>> getUserAttendance(
            @Parameter(description = "用户ID") @PathVariable Long userId,
            @Parameter(description = "开始日期(yyyy-MM-dd)") @RequestParam(required = false) String startDate,
            @Parameter(description = "结束日期(yyyy-MM-dd)") @RequestParam(required = false) String endDate) {
        List<AttendanceDTO> attendanceList = attendanceService.getAttendanceHistory(userId, startDate, endDate);
        return ApiResponse.success(attendanceList);
    }
}
