package com.mayank.CampusCloudUniversityCampusSystem.repository;

import com.mayank.CampusCloudUniversityCampusSystem.model.Attendance;
import com.mayank.CampusCloudUniversityCampusSystem.model.AttendanceDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Changed from findByStudentUnivId to findByStudentEmail
    List<Attendance> findByStudentEmail(String studentEmail);

    List<Attendance> findBySubjectId(Long subjectId);

    // Changed from findByFacultyUnivId to findByFacultyEmail
    List<Attendance> findByFacultyEmail(String facultyEmail);

    // Changed from findByStudentUnivIdAndSubjectId to findByStudentEmailAndSubjectId
    List<Attendance> findByStudentEmailAndSubjectId(String studentEmail, Long subjectId);

    // Changed from findByStudentUnivIdAndSubjectIdAndDate to findByStudentEmailAndSubjectIdAndDate
    Optional<Attendance> findByStudentEmailAndSubjectIdAndDate(String studentEmail, Long subjectId, LocalDate date);

    @Query("SELECT COUNT(DISTINCT a.date) FROM Attendance a WHERE a.subject.id = ?1")
    long countDistinctDatesBySubjectId(Long subjectId);

    // Changed to use email instead of univId
    @Query("SELECT COUNT(DISTINCT a.student.email) FROM Attendance a WHERE a.subject.id = ?1")
    long countDistinctStudentsBySubjectId(Long subjectId);

    List<Attendance> findBySubjectIdAndDate(Long subjectId, LocalDate date);

    List<Attendance> findByStudentEmailAndSubjectIdAndDateBetween(
            String studentEmail,
            Long subjectId,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("SELECT new com.mayank.CampusCloudUniversityCampusSystem.model.AttendanceDTO(a) " +
            "FROM Attendance a WHERE a.subject.id = :subjectId AND a.date = :date")
    List<AttendanceDTO> findDTOBySubjectIdAndDate(@Param("subjectId") Long subjectId,
                                                  @Param("date") LocalDate date);

    @Query("SELECT DISTINCT a.date FROM Attendance a WHERE a.subject.id = :subjectId")
    List<LocalDate> findDistinctDatesBySubjectId(@Param("subjectId") Long subjectId);


}