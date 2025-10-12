package com.mayank.CampusCloudUniversityCampusSystem.service;

import com.mayank.CampusCloudUniversityCampusSystem.model.*;
import com.mayank.CampusCloudUniversityCampusSystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepo;

    @Autowired
    private SubjectEnrollmentRepo subjectRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private FacultyRepo  facultyRepo;

    @Transactional
    public List<AttendanceDTO> markBulkAttendance(BulkAttendanceRequest request) {
        Faculty faculty = facultyRepo.findByEmail(request.getFacultyEmail())
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        SubjectEnrollment subject = subjectRepo.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if (!subject.getFaculty().getEmail().equals(faculty.getEmail())) {
            throw new RuntimeException("Faculty doesn't teach this subject");
        }

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        List<AttendanceDTO> results = new ArrayList<>();

        for (BulkAttendanceRequest.StudentAttendance sa : request.getStudentAttendances()) {
            Student student = studentRepo.findByEmail(sa.getStudentEmail())
                    .orElseThrow(() -> new RuntimeException("Student not found: " + sa.getStudentEmail()));

            if (!subject.getEnrolledStudents().contains(student)) {
                throw new RuntimeException("Student not enrolled: " + student.getEmail());
            }

            Attendance attendance = attendanceRepo
                    .findByStudentEmailAndSubjectIdAndDate(student.getEmail(), subject.getId(), date)
                    .orElse(new Attendance());

            attendance.setStudent(student);
            attendance.setFaculty(faculty);
            attendance.setSubject(subject);
            attendance.setDate(date);
            attendance.setPresent(sa.isPresent());
            attendance.setRemarks(sa.getRemarks());

            results.add(new AttendanceDTO(attendanceRepo.save(attendance)));
        }

        return results;
    }

    public List<AttendanceDTO> getAttendanceBySubjectAndDate(Long subjectId, LocalDate date) {
        return attendanceRepo.findDTOBySubjectIdAndDate(subjectId, date);
    }

    public List<SubjectEnrollmentDTO> getSubjectsByFaculty(String facultyEmail) {
        return subjectRepo.findDTOByFacultyEmail(facultyEmail);
    }

    public SubjectEnrollmentDTO getSubjectWithStudents(Long subjectId) {
        SubjectEnrollment subject = subjectRepo.findByIdWithStudents(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        // Use the new DTO constructor
        return new SubjectEnrollmentDTO(subject);
    }
    public AttendanceStats getSubjectAttendanceStats(Long subjectId) {
        List<LocalDate> classDates = attendanceRepo.findDistinctDatesBySubjectId(subjectId);
        List<Attendance> attendances = attendanceRepo.findBySubjectId(subjectId);

        int presentCount = (int) attendances.stream().filter(Attendance::isPresent).count();
        double percentage = classDates.isEmpty() ? 0 :
                Math.round((presentCount * 100.0 / (classDates.size() * attendances.size())) * 100) / 100.0;

        AttendanceStats stats = new AttendanceStats();
        stats.setTotalClasses(classDates.size());
        stats.setTotalPresent(presentCount);
        stats.setAttendancePercentage(percentage);

        return stats;
    }
    public Attendance findAttendance(String studentEmail, Long subjectId, LocalDate date) {
        return attendanceRepo
                .findByStudentEmailAndSubjectIdAndDate(studentEmail, subjectId, date)
                .orElse(null);
    }

}