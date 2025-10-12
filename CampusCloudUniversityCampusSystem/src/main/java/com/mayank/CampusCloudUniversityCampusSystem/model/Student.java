package com.mayank.CampusCloudUniversityCampusSystem.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String course;
    private String branch;
    private int semester;
    private int year;
    @Column(nullable = true)
    private String enrollmentCode;
    @Column(nullable = true)
    private boolean enrollmentCompleted;

    @Column(nullable = true)
    private String rollNo;

    @Column(unique = true,nullable = true)
    private String firebaseUid;

    @Column(nullable = true)
    private LocalDate dob;

    private Long contactNo;

    private String address;
    private String gender;
    @Column(nullable = true)
    private String nationality;
    @Column(nullable = true)
    private String bloodGroup;

    @Column(nullable = true)
    private Long parentContactNo;
    @Column(nullable = true)
    private String parentName;
    @Column(nullable = true)
    private String parentOccupation;

    @Email
    @Column(unique = true,name = "email")
    private String email;

    @Column(nullable = true,unique = true,name= "univ_id")
    private String univId;


    @Lob
    @Column(name = "stu_image", columnDefinition = "LONGBLOB")
    private byte[] stuImage;

    @ManyToMany(mappedBy = "enrolledStudents")
    private List<SubjectEnrollment> enrolledStudents = new ArrayList<>();
    @Column(nullable = true)
    private String password;

    public void addEnrollment(SubjectEnrollment enrollment) {
        this.enrolledStudents.add(enrollment);
        enrollment.getEnrolledStudents().add(this);
    }

}
