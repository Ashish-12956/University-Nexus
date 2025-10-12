package com.mayank.CampusCloudUniversityCampusSystem.controller;

import com.mayank.CampusCloudUniversityCampusSystem.repository.FacultyRepo;
import com.mayank.CampusCloudUniversityCampusSystem.repository.StudentRepo;
import com.mayank.CampusCloudUniversityCampusSystem.repository.SubjectEnrollmentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/AdminDashboard")
public class AdminDashboardController {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private FacultyRepo facultyRepo;

    @Autowired
    private SubjectEnrollmentRepo subjectEnrollmentRepo;

    @GetMapping("/students/count")
    public ResponseEntity<Long> getStudentCount() {
        return ResponseEntity.ok(studentRepo.count());
    }


    @GetMapping("/faculty/count")
    public ResponseEntity<Long> getTeacherCount() {
        return ResponseEntity.ok(facultyRepo.count());
    }

    @GetMapping("/classes/count")
    public ResponseEntity<?> getClassesCount(){
        return ResponseEntity.ok(subjectEnrollmentRepo.count());
    }
}
