package com.kaoqin.repository;

import com.kaoqin.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByUserIdOrderByCreateTimeDesc(Long userId);

    @Query("SELECT a FROM Attendance a WHERE a.userId = ?1 AND a.clockInTime BETWEEN ?2 AND ?3")
    List<Attendance> findByUserIdAndClockInTimeBetween(Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Attendance a WHERE a.userId = ?1 AND FUNCTION('DATE', a.clockInTime) = FUNCTION('DATE', ?2)")
    Optional<Attendance> findTodayAttendanceByUserId(Long userId, LocalDateTime date);
}
