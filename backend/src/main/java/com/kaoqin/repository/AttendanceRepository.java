package com.kaoqin.repository;

import com.kaoqin.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long>, JpaSpecificationExecutor<Attendance> {

    Optional<Attendance> findByUserIdAndDate(Long userId, LocalDate date);

    List<Attendance> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByUserId(Long userId);
}
