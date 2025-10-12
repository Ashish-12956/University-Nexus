package com.mayank.CampusCloudUniversityCampusSystem.model;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BulkAttendanceRequest {
    private String facultyEmail;
    private Long subjectId;
    private LocalDate date;
    private List<StudentAttendance> studentAttendances;

    @Data
    public static class StudentAttendance {
        private String studentEmail;
        private boolean present;
        private String remarks;
    }
}