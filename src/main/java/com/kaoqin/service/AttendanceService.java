package com.kaoqin.service;

import com.kaoqin.entity.Attendance;
import com.kaoqin.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    public List<Attendance> findAll() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> findByUserId(Long userId) {
        return attendanceRepository.findByUserIdOrderByCreateTimeDesc(userId);
    }

    public Optional<Attendance> findById(Long id) {
        return attendanceRepository.findById(id);
    }

    public Attendance clockIn(Long userId, String clockInType) {
        LocalDateTime now = LocalDateTime.now();

        Optional<Attendance> todayAttendance = attendanceRepository.findTodayAttendanceByUserId(userId, now);

        if (todayAttendance.isPresent()) {
            Attendance attendance = todayAttendance.get();
            if (attendance.getClockInTime() != null) {
                throw new RuntimeException("今日已签到");
            }
        }

        Attendance attendance = new Attendance();
        attendance.setUserId(userId);
        attendance.setClockInTime(now);
        attendance.setStatus(Attendance.AttendanceStatus.CLOCKED_IN);
        attendance.setClockInType(clockInType != null ? clockInType : "BUTTON");
        attendance.setCreateTime(now);
        attendance.setUpdateTime(now);

        return attendanceRepository.save(attendance);
    }

    public Attendance clockOut(Long userId) {
        LocalDateTime now = LocalDateTime.now();

        Optional<Attendance> todayAttendance = attendanceRepository.findTodayAttendanceByUserId(userId, now);

        if (todayAttendance.isEmpty()) {
            throw new RuntimeException("今日未签到，请先签到");
        }

        Attendance attendance = todayAttendance.get();

        attendance.setClockOutTime(now);
        attendance.setStatus(Attendance.AttendanceStatus.CLOCKED_OUT);
        attendance.setUpdateTime(now);

        return attendanceRepository.save(attendance);
    }

    public Optional<Attendance> getTodayAttendance(Long userId) {
        return attendanceRepository.findTodayAttendanceByUserId(userId, LocalDateTime.now());
    }

    public List<Attendance> findByUserIdAndDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return attendanceRepository.findByUserIdAndClockInTimeBetween(userId, start, end);
    }
}
