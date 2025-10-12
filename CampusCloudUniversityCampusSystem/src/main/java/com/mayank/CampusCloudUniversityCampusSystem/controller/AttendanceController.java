package com.mayank.CampusCloudUniversityCampusSystem.controller;

import com.mayank.CampusCloudUniversityCampusSystem.model.*;
import com.mayank.CampusCloudUniversityCampusSystem.repository.AttendanceRepository;
import com.mayank.CampusCloudUniversityCampusSystem.repository.SubjectEnrollmentRepo;
import com.mayank.CampusCloudUniversityCampusSystem.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private SubjectEnrollmentRepo subjectRepo;

    @Autowired
    AttendanceRepository attendanceRepo;
    /**
     * Bulk mark attendance for a given subject/date.
     */
    @PostMapping("/bulk")
    public ResponseEntity<?> markBulkAttendance(@RequestBody BulkAttendanceRequest request) {
        try {
            List<AttendanceDTO> result = attendanceService.markBulkAttendance(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Fetch or initialize attendance records for a subject on a specific date.
     * Returns one AttendanceDTO per enrolled student, with present=false if no record exists.
     */
    @GetMapping("/subject/{subjectId}/date/{date}")
    public ResponseEntity<?> getAttendanceBySubjectAndDate(
            @PathVariable Long subjectId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            // Fetch subject with enrolled students
            SubjectEnrollment subject = subjectRepo.findByIdWithStudents(subjectId)
                    .orElseThrow(() -> new RuntimeException("Subject not found"));

            // Build one AttendanceDTO per student
            List<AttendanceDTO> dtos = new ArrayList<>();
            for (Student student : subject.getEnrolledStudents()) {
                Attendance existing = attendanceService.findAttendance(student.getEmail(), subjectId, date);
                Attendance attendance = existing != null ? existing : new Attendance();

                // populate for new record
                attendance.setStudent(student);
                attendance.setFaculty(subject.getFaculty());
                attendance.setSubject(subject);
                attendance.setDate(date);
                attendance.setPresent(existing != null && existing.isPresent());

                dtos.add(new AttendanceDTO(attendance));
            }
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get the list of subjects (with enrolled students) for a faculty member.
     */
    @GetMapping("/faculty/{email}/subjects")
    public ResponseEntity<List<SubjectEnrollmentDTO>> getSubjectsByFaculty(@PathVariable String email) {
        List<SubjectEnrollmentDTO> dtos = subjectRepo.findDTOByFacultyEmail(email);
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get one subject (with its students) by subject ID.
     */
    @GetMapping("/subject/{id}/students")
    public ResponseEntity<SubjectEnrollmentDTO> getSubjectWithStudents(@PathVariable Long id) {
        SubjectEnrollment subject = subjectRepo.findByIdWithStudents(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        return ResponseEntity.ok(new SubjectEnrollmentDTO(subject));
    }

    /**
     * Get attendance statistics for a given subject.
     */
    @GetMapping("/stats/subject/{subjectId}")
    public ResponseEntity<?> getSubjectAttendanceStats(@PathVariable Long subjectId) {
        try {
            AttendanceStats stats = attendanceService.getSubjectAttendanceStats(subjectId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/student/{email}")
    public ResponseEntity<List<AttendanceDTO>> getAllAttendanceForStudent(
            @PathVariable String email,
            @RequestHeader("Authorization") String authHeader) {

        // (optionally verify token header here)

        List<AttendanceDTO> dtos = attendanceRepo
                .findByStudentEmail(email)                    // returns Attendance entities
                .stream()
                .map(AttendanceDTO::new)
                .toList();

        return ResponseEntity.ok(dtos);
    }
    // Add this to your AttendanceController
    @GetMapping("/student/{email}/subjects")
    public ResponseEntity<List<SubjectEnrollmentDTO>> getSubjectsByStudent(@PathVariable String email) {
        List<SubjectEnrollmentDTO> dtos = subjectRepo.findDTOByStudentEmail(email);
        return ResponseEntity.ok(dtos);
    }
    @GetMapping("/student/{email}/subject/{subjectId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByStudentAndSubject(
            @PathVariable String email,
            @PathVariable Long subjectId) {
        List<AttendanceDTO> dtos = attendanceRepo
                .findByStudentEmailAndSubjectId(email, subjectId)
                .stream()
                .map(AttendanceDTO::new)
                .toList();
        return ResponseEntity.ok(dtos);
    }
}
