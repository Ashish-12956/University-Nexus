package com.mayank.CampusCloudUniversityCampusSystem.model;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceDTO {
    private Long id;
    private Long subjectId;      // new
    private String studentName;
    private String studentEmail;
    private String studentRollNo;
    private String subjectName;
    private String subjectCode;
    private LocalDate date;
    private boolean present;
    private String remarks;

    public AttendanceDTO(Attendance a) {
        this.id            = a.getId();
        this.subjectId     = a.getSubject().getId();              // wire up
        this.studentName   = a.getStudent().getName();
        this.studentEmail  = a.getStudent().getEmail();
        this.studentRollNo = a.getStudent().getRollNo();
        this.subjectName   = a.getSubject().getSubjectName();
        this.subjectCode   = a.getSubject().getSubjectCode();
        this.date          = a.getDate();
        this.present       = a.isPresent();
        this.remarks       = a.getRemarks();
    }
}
