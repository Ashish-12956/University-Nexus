package com.mayank.CampusCloudUniversityCampusSystem.model;


import lombok.Data;

@Data
public class EnrollmentRequest {
    private String subjectName;
    private String subjectCode;
    private int credits;
    private String emailId;
}