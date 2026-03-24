package com.kaoqin.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "attendances")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "check_in_type", length = 20)
    private String checkInType = "BUTTON";

    @Column(name = "check_out_type", length = 20)
    private String checkOutType;

    @Column(name = "check_in_location", length = 200)
    private String checkInLocation;

    @Column(name = "check_out_location", length = 200)
    private String checkOutLocation;

    @Column(length = 20)
    private String status = "NORMAL";

    @Column(length = 500)
    private String remark;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
