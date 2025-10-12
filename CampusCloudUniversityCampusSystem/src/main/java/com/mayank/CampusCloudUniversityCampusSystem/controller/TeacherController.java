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

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/faculty")
public class TeacherController {

    @Autowired
    private FacultyRepo teacherRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private StudentRepo studentRepo;

    // Get teacher profile by email
    @GetMapping("/by-email/{email}")
    public ResponseEntity<?> getTeacherProfile(
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

            Faculty teacher = teacherRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            return ResponseEntity.ok(teacher);

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
            Faculty teacher = teacherRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            teacher.setImage(file.getBytes());
            Faculty savedTeacher = teacherRepository.save(teacher);

            // Return success response with image data
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Image uploaded successfully");
            response.put("email", email);
            response.put("imageSize", savedTeacher.getImage().length);

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
            Faculty teacher = teacherRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            if (teacher.getImage() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No profile image found");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(teacher.getImage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving image: " + e.getMessage());
        }
    }

    @GetMapping("/students/all")
    public ResponseEntity<List <Student>> getAllStudents(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            User user = authService.verifyTokenAndGetUser(token)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Student> students = studentRepo.findAll();

            // Verify the data before returning
            if (students == null || students.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}