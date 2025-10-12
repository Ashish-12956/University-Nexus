package com.mayank.CampusCloudUniversityCampusSystem.model;

import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.CsvDate;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.springframework.boot.autoconfigure.web.WebProperties;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class StudentCsvRepresentation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CsvBindByName(column = "name")
    private String name;
    @CsvBindByName(column = "course")
    private String course;
    @CsvBindByName(column = "branch")
    private String branch;
    @CsvBindByName(column = "semester")
    private int semester;
    @CsvBindByName(column = "year")
    private int year;
    @CsvBindByName(column = "enrollmentCode")
    private String enrollmentCode;
    @CsvBindByName(column = "isEnrollmentCompleted")
    private boolean isEnrollmentCompleted;

    @CsvBindByName(column = "rollNo")
    private Long rollNo;

    @CsvDate("yyyy-MM-dd")
    @CsvBindByName(column = "dob")
    private LocalDate dob;

    @CsvBindByName(column = "contactNo")
    private Long contactNo;

    @CsvBindByName(column = "address")
    private String address;
    @CsvBindByName(column = "gender")
    private String gender;
    @CsvBindByName(column = "nationality")
    private String nationality;
    @CsvBindByName(column = "bloodGroup")
    private String bloodGroup;
    @CsvBindByName(column = "parentContactNo")
    private Long parentContactNo;
    @CsvBindByName(column = "parentName")
    private String parentName;
    @CsvBindByName(column = "parentOccupation")
    private String parentOccupation;

    @Column(nullable = false)
    private String firebaseUid;
    @Email
    @CsvBindByName(column = "emailId")
    private String emailId;

    @Lob
    @Column(nullable = true,updatable = true)
    private byte[] stuImage;

}
