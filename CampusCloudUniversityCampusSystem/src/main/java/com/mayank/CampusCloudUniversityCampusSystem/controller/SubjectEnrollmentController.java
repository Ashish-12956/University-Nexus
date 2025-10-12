package com.mayank.CampusCloudUniversityCampusSystem.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.mayank.CampusCloudUniversityCampusSystem.model.*;
import com.mayank.CampusCloudUniversityCampusSystem.repository.*;
import com.mayank.CampusCloudUniversityCampusSystem.service.*;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/enrollments")
public class SubjectEnrollmentController {

    @Autowired
    private SubjectEnrollmentRepo subjectEnrollmentRepo;

    @Autowired
    private FacultyRepo facultyRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private SubjectEnrollmentService enrollmentService;

    // Get all enrollments
    @GetMapping
    public ResponseEntity<?> getAllEnrollments() {
        try {
            List<SubjectEnrollment> enrollments = subjectEnrollmentRepo.findAll();
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching enrollments: " + e.getMessage());
        }
    }

    // Create enrollment for all students
    @PostMapping("/create-for-all")
    public ResponseEntity<?> createEnrollmentForAllStudents(@RequestBody EnrollmentRequest request) {
        try {
            // Validate request
            if (request.getSubjectName() == null || request.getSubjectName().isEmpty()) {
                return ResponseEntity.badRequest().body("Subject name is required");
            }
            if (request.getSubjectCode() == null || request.getSubjectCode().isEmpty()) {
                return ResponseEntity.badRequest().body("Subject code is required");
            }
            if (request.getEmailId() == null || request.getEmailId().isEmpty()) {
                return ResponseEntity.badRequest().body("Faculty email  ID is required");
            }

            SubjectEnrollment enrollment = enrollmentService.createEnrollmentForAllStudents(request);
            return ResponseEntity.ok(enrollment);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating enrollment: " + e.getMessage());
        }
    }

    @GetMapping("/faculty")
    public ResponseEntity<?> getSubjectsByFaculty(@RequestHeader("Authorization") String authHeader) {
        try {
            String facultyEmail = extractEmailFromToken(authHeader);

            // Option 1: Return entities (simpler but may expose more data than needed)
            List<SubjectEnrollment> subjects = subjectEnrollmentRepo.findByFacultyEmail(facultyEmail);

            // Option 2: Return DTOs (recommended for better control)
            // List<SubjectEnrollmentDTO> subjects = subjectEnrollmentRepo.findDTOByFacultyEmail(facultyEmail);

            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    private String extractEmailFromToken(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            return decodedToken.getEmail();
        } catch (Exception e) {
            throw new RuntimeException("Invalid token: " + e.getMessage());
        }
    }
    // Add to SubjectEnrollmentController.java
    @GetMapping("/{subjectId}")
    public ResponseEntity<?> getEnrollmentById(@PathVariable Long subjectId) {
        try {
            SubjectEnrollment enrollment = subjectEnrollmentRepo.findById(subjectId)
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));

            // Initialize the enrolledStudents collection
            Hibernate.initialize(enrollment.getEnrolledStudents());

            return ResponseEntity.ok(enrollment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}