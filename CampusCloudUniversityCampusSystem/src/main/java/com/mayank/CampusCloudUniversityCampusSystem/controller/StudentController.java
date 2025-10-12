package com.mayank.CampusCloudUniversityCampusSystem.controller;

import com.mayank.CampusCloudUniversityCampusSystem.model.*;
import com.mayank.CampusCloudUniversityCampusSystem.repository.*;
import com.mayank.CampusCloudUniversityCampusSystem.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;

@CrossOrigin
@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepo studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private SubjectEnrollmentRepo subjectEnrollmentRepo;

    @Autowired
    private AuthService authService;

    // Get student profile by email
    @GetMapping("/by-email/{email}")
    public ResponseEntity<?> getStudentProfile(
            @PathVariable String email,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");

            // Verify token and get user email
            User user = authService.verifyTokenAndGetUser(token)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getEmail().equalsIgnoreCase(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied");
            }

            Student student = studentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            return ResponseEntity.ok(student);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    // Get all subjects for a student by email
    @GetMapping("/{email}/subjects")
    public ResponseEntity<?> getStudentSubjects(
            @PathVariable String email,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            User user = authService.verifyTokenAndGetUser(token)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getEmail().equalsIgnoreCase(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied");
            }

            // <-- Use the nested-property query here
            List<SubjectEnrollment> subjects =
                    subjectEnrollmentRepo.findByEnrolledStudentsEmail(email);

            return ResponseEntity.ok(subjects);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    // Get attendance summary for all subjects by email
    @GetMapping("/{email}/attendance-summary")
    public ResponseEntity<?> getAttendanceSummary(
            @PathVariable String email,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            User user = authService.verifyTokenAndGetUser(token)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getEmail().equalsIgnoreCase(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied");
            }

            LocalDate start = startDate != null
                    ? LocalDate.parse(startDate)
                    : LocalDate.now().minusMonths(6);
            LocalDate end = endDate != null
                    ? LocalDate.parse(endDate)
                    : LocalDate.now();

            List<SubjectEnrollment> subjects =
                    subjectEnrollmentRepo.findByEnrolledStudentsEmail(email);

            List<Map<String, Object>> attendanceSummary = new ArrayList<>();
            for (SubjectEnrollment subject : subjects) {
                List<Attendance> records =
                        attendanceRepository.findByStudentEmailAndSubjectIdAndDateBetween(
                                email, subject.getId(), start, end
                        );

                long totalClasses = records.stream()
                        .map(Attendance::getDate)
                        .distinct()
                        .count();
                long presentCount = records.stream()
                        .filter(Attendance::isPresent)
                        .count();
                double percentage = totalClasses > 0
                        ? Math.round((presentCount * 100.0 / totalClasses) * 100) / 100.0
                        : 0.0;

                Map<String, Object> summary = new HashMap<>();
                summary.put("subjectName",
                        subject.getSubjectName() + "(" + subject.getCredits() + ")");
                summary.put("subjectCode", subject.getSubjectCode());
                summary.put("faculty", subject.getFaculty().getName());
                summary.put("totalLectures", totalClasses);
                summary.put("totalPresent", presentCount);
                summary.put("percentage", percentage);

                attendanceSummary.add(summary);
            }

            double overallPercentage = attendanceSummary.stream()
                    .mapToDouble(m -> (double) m.get("percentage"))
                    .average()
                    .orElse(0.0);

            Map<String, Object> response = new HashMap<>();
            response.put("startDate", start);
            response.put("endDate", end);
            response.put("overallPercentage",
                    Math.round(overallPercentage * 100) / 100.0);
            response.put("subjects", attendanceSummary);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // Get detailed attendance for a specific subject by email
    @GetMapping("/{email}/attendance/{subjectId}")
    public ResponseEntity<?> getSubjectAttendance(
            @PathVariable String email,
            @PathVariable Long subjectId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            User user = authService.verifyTokenAndGetUser(token)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getEmail().equalsIgnoreCase(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied");
            }

            SubjectEnrollment subject =
                    subjectEnrollmentRepo.findById(subjectId)
                            .orElseThrow(() ->
                                    new RuntimeException("Subject not found"));

            // Verify the student is enrolled
            boolean isEnrolled = subject.getEnrolledStudents().stream()
                    .anyMatch(s -> s.getEmail()
                            .equalsIgnoreCase(email));
            if (!isEnrolled) {
                throw new RuntimeException("Student is not enrolled in this subject");
            }

            List<Attendance> records =
                    attendanceRepository.findByStudentEmailAndSubjectId(email,
                            subjectId);

            return ResponseEntity.ok(records);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam("email") String email,
            @RequestHeader("Authorization") String authHeader) {

        try {
            // Authentication and validation
            String token = authHeader.replace("Bearer ", "");
            User user = authService.verifyTokenAndGetUser(token)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getEmail().equalsIgnoreCase(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }

            // Validate image
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select an image file");
            }
            if (!file.getContentType().startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }
            if (file.getSize() > 2 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Image size must be less than 2MB");
            }

            // Save image
            Student student = studentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            student.setStuImage(file.getBytes());
            Student savedStudent = studentRepository.save(student);

            // Return success response with image data
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Image uploaded successfully");
            response.put("email", email);
            response.put("imageSize", savedStudent.getStuImage().length);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading image: " + e.getMessage());
        }
    }

    @GetMapping(value = "/profile-image/{email}", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<?> getProfileImage(
            @PathVariable String email,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Authentication
            String token = authHeader.replace("Bearer ", "");
            User user = authService.verifyTokenAndGetUser(token)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getEmail().equalsIgnoreCase(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }

            // Get image
            Student student = studentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            if (student.getStuImage() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No profile image found");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(student.getStuImage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving image: " + e.getMessage());
        }
    }

}
