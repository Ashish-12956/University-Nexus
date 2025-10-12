package com.mayank.CampusCloudUniversityCampusSystem.model;

import lombok.Data;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class SubjectEnrollmentDTO {
    private Long id;
    private String subjectName;
    private String subjectCode;
    private int credits;
    private String facultyEmail;
    private List<StudentDTO> enrolledStudents;

    // Constructor for JPQL query
    public SubjectEnrollmentDTO(Long id, String subjectName, String subjectCode,
                                int credits, String facultyEmail) {
        this.id = id;
        this.subjectName = subjectName;
        this.subjectCode = subjectCode;
        this.credits = credits;
        this.facultyEmail = facultyEmail;
    }

    // Constructor for entity conversion
    public SubjectEnrollmentDTO(SubjectEnrollment subject) {
        this.id = subject.getId();
        this.subjectName = subject.getSubjectName();
        this.subjectCode = subject.getSubjectCode();
        this.credits = subject.getCredits();
        this.facultyEmail = subject.getFaculty().getEmail();

        if (subject.getEnrolledStudents() != null) {
            this.enrolledStudents = subject.getEnrolledStudents().stream()
                    .map(StudentDTO::new)
                    .collect(Collectors.toList());
        }
    }
}