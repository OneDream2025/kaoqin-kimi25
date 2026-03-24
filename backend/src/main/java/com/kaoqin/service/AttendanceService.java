package com.kaoqin.service;

import com.kaoqin.dto.AttendanceDTO;
import com.kaoqin.dto.CheckInRequest;
import com.kaoqin.dto.TodayAttendanceDTO;
import com.kaoqin.entity.Attendance;
import com.kaoqin.entity.User;
import com.kaoqin.repository.AttendanceRepository;
import com.kaoqin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public TodayAttendanceDTO getTodayAttendance(Long userId) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> attendanceOpt = attendanceRepository.findByUserIdAndDate(userId, today);

        if (attendanceOpt.isPresent()) {
            Attendance attendance = attendanceOpt.get();
            String workDuration = calculateWorkDuration(attendance.getCheckInTime(), attendance.getCheckOutTime());

            return TodayAttendanceDTO.builder()
                    .status(attendance.getCheckOutTime() != null ? "已下班" : "已上班")
                    .checkInTime(attendance.getCheckInTime())
                    .checkOutTime(attendance.getCheckOutTime())
                    .workDuration(workDuration)
                    .canCheckIn(false)
                    .canCheckOut(attendance.getCheckOutTime() == null)
                    .build();
        } else {
            return TodayAttendanceDTO.builder()
                    .status("未打卡")
                    .canCheckIn(true)
                    .canCheckOut(false)
                    .build();
        }
    }

    @Transactional
    public AttendanceDTO checkIn(Long userId, CheckInRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("用户不存在"));

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Optional<Attendance> existingAttendance = attendanceRepository.findByUserIdAndDate(userId, today);
        Attendance attendance;

        switch (request.getType()) {
            case CHECK_IN:
                if (existingAttendance.isPresent() && existingAttendance.get().getCheckInTime() != null) {
                    throw new IllegalArgumentException("今天已经打过上班卡了");
                }

                if (existingAttendance.isPresent()) {
                    attendance = existingAttendance.get();
                } else {
                    attendance = new Attendance();
                    attendance.setUserId(userId);
                    attendance.setDate(today);
                }
                attendance.setCheckInTime(now);
                attendance.setCheckInType("BUTTON");
                attendance.setCheckInLocation(request.getLocation());
                attendance.setStatus(determineCheckInStatus(now));
                break;

            case CHECK_OUT:
                if (existingAttendance.isEmpty() || existingAttendance.get().getCheckInTime() == null) {
                    throw new IllegalArgumentException("请先打上班卡");
                }
                if (existingAttendance.get().getCheckOutTime() != null) {
                    throw new IllegalArgumentException("今天已经打过下班卡了");
                }

                attendance = existingAttendance.get();
                attendance.setCheckOutTime(now);
                attendance.setCheckOutType("BUTTON");
                attendance.setCheckOutLocation(request.getLocation());
                break;

            default:
                throw new IllegalArgumentException("无效的打卡类型");
        }

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return convertToDTO(savedAttendance, user.getName());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceHistory(Long userId, String startDateStr, String endDateStr) {
        LocalDate startDate;
        LocalDate endDate;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        if (startDateStr != null && !startDateStr.isEmpty()) {
            startDate = LocalDate.parse(startDateStr, formatter);
        } else {
            startDate = LocalDate.now().minusMonths(1);
        }

        if (endDateStr != null && !endDateStr.isEmpty()) {
            endDate = LocalDate.parse(endDateStr, formatter);
        } else {
            endDate = LocalDate.now();
        }

        List<Attendance> attendances = attendanceRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        return attendances.stream()
                .map(attendance -> {
                    String userName = userRepository.findById(attendance.getUserId())
                            .map(User::getName)
                            .orElse("未知用户");
                    return convertToDTO(attendance, userName);
                })
                .collect(Collectors.toList());
    }

    private String determineCheckInStatus(LocalDateTime checkInTime) {
        int hour = checkInTime.getHour();
        int minute = checkInTime.getMinute();

        if (hour < 9 || (hour == 9 && minute <= 0)) {
            return "NORMAL";
        } else if (hour < 10 || (hour == 10 && minute <= 0)) {
            return "LATE";
        } else {
            return "SERIOUS_LATE";
        }
    }

    private String calculateWorkDuration(LocalDateTime checkInTime, LocalDateTime checkOutTime) {
        if (checkInTime == null || checkOutTime == null) {
            return "--";
        }

        Duration duration = Duration.between(checkInTime, checkOutTime);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();

        return String.format("%d小时%d分钟", hours, minutes);
    }

    private AttendanceDTO convertToDTO(Attendance attendance, String userName) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setUserId(attendance.getUserId());
        dto.setUserName(userName);
        dto.setDate(attendance.getDate());
        dto.setCheckInTime(attendance.getCheckInTime());
        dto.setCheckOutTime(attendance.getCheckOutTime());
        dto.setCheckInType(attendance.getCheckInType());
        dto.setCheckOutType(attendance.getCheckOutType());
        dto.setCheckInLocation(attendance.getCheckInLocation());
        dto.setCheckOutLocation(attendance.getCheckOutLocation());
        dto.setStatus(attendance.getStatus());
        dto.setRemark(attendance.getRemark());
        dto.setWorkDuration(calculateWorkDuration(attendance.getCheckInTime(), attendance.getCheckOutTime()));
        return dto;
    }
}
