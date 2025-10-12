package com.mayank.CampusCloudUniversityCampusSystem.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudentDTO {
    private String email;
    private String name;
    private String rollNo;
    private String univId;

    // Alternative constructor that takes a Student entity
    public StudentDTO(Student student) {
        this.email = student.getEmail();
        this.name = student.getName();
        this.rollNo = student.getRollNo();
        this.univId = student.getUnivId();
    }
}