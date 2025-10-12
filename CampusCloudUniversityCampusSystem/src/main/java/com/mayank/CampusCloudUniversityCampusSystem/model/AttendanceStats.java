package com.mayank.CampusCloudUniversityCampusSystem.model;

import lombok.Data;

import java.time.LocalDate;
import java.util.Map;

@Data
public class AttendanceStats {
    private int totalClasses;
    private int totalPresent;
    private double attendancePercentage;
    private Map<LocalDate, Integer> dailyAttendance;
}