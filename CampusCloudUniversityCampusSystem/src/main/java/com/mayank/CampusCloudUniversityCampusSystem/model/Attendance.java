package com.mayank.CampusCloudUniversityCampusSystem.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.mayank.CampusCloudUniversityCampusSystem.model.Faculty;
import com.mayank.CampusCloudUniversityCampusSystem.model.Student;
import com.mayank.CampusCloudUniversityCampusSystem.model.SubjectEnrollment;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// Remove the @PrePersist annotation since we're now handling dates explicitly
@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_email", referencedColumnName = "email")
    @JsonBackReference
    private Student student;

    @ManyToOne
    @JoinColumn(name = "faculty_email", referencedColumnName = "email")
    @JsonBackReference
    private Faculty faculty;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    @JsonBackReference
    private SubjectEnrollment subject;

    private LocalDate date;
    private boolean present;
    private String remarks;

    // Removed the @PrePersist method
}