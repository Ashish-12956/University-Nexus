package com.mayank.CampusCloudUniversityCampusSystem.repository;

import com.mayank.CampusCloudUniversityCampusSystem.model.SubjectEnrollment;
import com.mayank.CampusCloudUniversityCampusSystem.model.SubjectEnrollmentDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubjectEnrollmentRepo extends JpaRepository<SubjectEnrollment, Long> {

    // DTO projection
    @Query("SELECT new com.mayank.CampusCloudUniversityCampusSystem.model.SubjectEnrollmentDTO(" +
            "s.id, s.subjectName, s.subjectCode, s.credits, s.faculty.email) " +
            "FROM SubjectEnrollment s " +
            "WHERE s.faculty.email = :email")
    List<SubjectEnrollmentDTO> findDTOByFacultyEmail(@Param("email") String email);

    // fetch students eagerly when needed
    @Query("SELECT s FROM SubjectEnrollment s LEFT JOIN FETCH s.enrolledStudents WHERE s.faculty.email = :email")
    List<SubjectEnrollment> findByFacultyEmailWithStudents(@Param("email") String email);

    // simple find by faculty
    List<SubjectEnrollment> findByFacultyEmail(String facultyEmail);

    // ← NEW: traverse the collection’s 'email' field
    List<SubjectEnrollment> findByEnrolledStudentsEmail(String email);

    // you can still keep your custom fetch-by-id:
    @Query("SELECT se FROM SubjectEnrollment se JOIN FETCH se.enrolledStudents WHERE se.id = :id")
    Optional<SubjectEnrollment> findByIdWithStudents(@Param("id") Long id);

    @Query("""
      SELECT new com.mayank.CampusCloudUniversityCampusSystem.model.SubjectEnrollmentDTO(
        s.id, s.subjectName, s.subjectCode, s.credits, s.faculty.email
      )
      FROM SubjectEnrollment s
      JOIN s.enrolledStudents st
      WHERE st.email = :email
    """)
    List<SubjectEnrollmentDTO> findDTOByStudentEmail(@Param("email") String email);
}
