package com.mayank.CampusCloudUniversityCampusSystem.service;

import com.mayank.CampusCloudUniversityCampusSystem.model.EnrollmentRequest;
import com.mayank.CampusCloudUniversityCampusSystem.model.Faculty;
import com.mayank.CampusCloudUniversityCampusSystem.model.Student;
import com.mayank.CampusCloudUniversityCampusSystem.model.SubjectEnrollment;
import com.mayank.CampusCloudUniversityCampusSystem.repository.FacultyRepo;
import com.mayank.CampusCloudUniversityCampusSystem.repository.StudentRepo;
import com.mayank.CampusCloudUniversityCampusSystem.repository.SubjectEnrollmentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectEnrollmentService {

    @Autowired
    private SubjectEnrollmentRepo subjectRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private FacultyRepo facultyRepo;

    @Transactional
    public SubjectEnrollment createEnrollmentForAllStudents(EnrollmentRequest request) {

        Faculty faculty = facultyRepo.findByEmail(request.getEmailId())
                .orElseThrow(() -> new RuntimeException("Faculty not found with ID: " + request.getEmailId()));

        // Create new subject enrollment
        SubjectEnrollment enrollment = new SubjectEnrollment();
        enrollment.setSubjectName(request.getSubjectName());
        enrollment.setSubjectCode(request.getSubjectCode());
        enrollment.setCredits(request.getCredits());
        enrollment.setFaculty(faculty);

        // Get all students and enroll them
        List<Student> students = studentRepo.findAll();
        if (students.isEmpty()) {
            throw new RuntimeException("No students available for enrollment");
        }

        // 4. Establish bidirectional relationship
        enrollment.setEnrolledStudents(students);
        students.forEach(student -> student.getEnrolledStudents().add(enrollment));

        // 5. Save the enrollment

        return subjectRepo.save(enrollment);
    }
}
