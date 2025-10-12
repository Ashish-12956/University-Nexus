package com.mayank.CampusCloudUniversityCampusSystem.service;

import com.mayank.CampusCloudUniversityCampusSystem.model.*;
import com.mayank.CampusCloudUniversityCampusSystem.repository.AdminRepo;
import com.mayank.CampusCloudUniversityCampusSystem.repository.FacultyRepo;
import com.mayank.CampusCloudUniversityCampusSystem.repository.StudentRepo;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;
import jakarta.persistence.Column;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.view.RedirectView;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Builder
@Component

public class AdminService {

    @Autowired
    AdminRepo adminRepo;

    @Autowired
    Admin admin;

    @Autowired
    private StudentRepo studentRepo;
    @Autowired
    private FacultyRepo facultyRepo;
    @Autowired
    private UserService service;
    public Integer uploadDetailsOfStudentsBulk (MultipartFile file) throws Exception {

        Set<Student> students = parseCsv(file);
        List<Student> savedStudents = studentRepo.saveAll(students);

        for (Student stu : savedStudents){
            String rollNo = generateRollNo(stu.getYear(), stu.getBranch(), stu.getId());
            String password = generatePassword(stu.getDob());
            stu.setPassword(password);
            stu.setRollNo(rollNo);
            stu.setUnivId(generateUnivId(stu.getName(),stu.getContactNo()));

            User user = service.createUser(stu.getEmail(),stu.getPassword(),stu.getName(),"student",stu.getUnivId());
            stu.setFirebaseUid(user.getFirebaseUid());
        }

        studentRepo.saveAll(savedStudents);


        return students.size();

    }

    private String generateRollNo(int year, String branch, Long id) {

        return String.valueOf(year) + branch + String.valueOf(id);
    }

    private String generatePassword(LocalDate dob){
       return dob.toString();
    }

    public Set <Student> parseCsv (MultipartFile file) throws IOException {

        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))){

            HeaderColumnNameMappingStrategy <StudentCsvRepresentation> strategy = new HeaderColumnNameMappingStrategy<>();

            strategy.setType(StudentCsvRepresentation.class);
            CsvToBean<StudentCsvRepresentation> csvToBean  = new CsvToBeanBuilder<StudentCsvRepresentation>(reader)
                    .withMappingStrategy(strategy)
                    .withIgnoreEmptyLine(true)
                    .withIgnoreLeadingWhiteSpace(true)
                    .build();

            return csvToBean.parse()
                    .stream()
                    .map(csv -> Student.builder()
                            .name(csv.getName())
                            .course(csv.getCourse())
                            .branch(csv.getBranch())
                            .semester(csv.getSemester())
                            .year(csv.getYear())
                            .enrollmentCode(csv.getEnrollmentCode())
                            .enrollmentCompleted(csv.isEnrollmentCompleted())
                            .rollNo(String.valueOf(csv.getRollNo()))
                            .dob(csv.getDob())
                            .contactNo(csv.getContactNo())
                            .address(csv.getAddress())
                            .gender(csv.getGender())
                            .nationality(csv.getNationality())
                            .bloodGroup(csv.getBloodGroup())
                            .parentContactNo(csv.getParentContactNo())
                            .parentName(csv.getParentName())
                            .parentOccupation(csv.getParentOccupation())
                            .email(csv.getEmailId())
                            .stuImage(csv.getStuImage())
                            .univId(generateUnivId(csv.getName(), csv.getContactNo()))
                            .build()
                    )
                    .collect(Collectors.toSet());
        }
    }



    public String generateUnivId (String name,long contactNo){

        long lastDigit = contactNo % 10;
        long secondLastDigit = (contactNo / 10) % 10;
        long thirdLastDigit = (contactNo / 100) % 10;

        String []nameParts = name.split("\\s+");

        String firstName = nameParts[0];

        return reverse(firstName) + String.valueOf(thirdLastDigit) + String.valueOf(secondLastDigit) + String.valueOf(lastDigit)+
        (int)(Math.random()*100) + "@stu.edu";

    }

    public String generateUnivIdFaculty (String name,long contactNo){

        long lastDigit = contactNo % 10;
        long secondLastDigit = (contactNo / 10) % 10;
        long thirdLastDigit = (contactNo / 100) % 10;

        String []nameParts = name.split("\\s+");

        String firstName = nameParts[1];

        return reverse(firstName) + String.valueOf(thirdLastDigit) + String.valueOf(secondLastDigit) + String.valueOf(lastDigit) +

            (int)(Math.random() * 100)  + "@univ.edu";

    }

    public String reverse (String name){

        return new StringBuilder(name).reverse().toString();
    }

    public Student uploadStudentDetail(Student student) throws Exception {
        // Check if email already exists
        if (studentRepo.findByEmail(student.getEmail()).isPresent()) {
            throw new Exception("Email already exists");
        }

        // Set default values for required fields if not provided
        if (student.getPassword() == null) {
            student.setPassword(student.getDob() != null ?
                    student.getDob().toString() : "password123");
        }

        // Save student first to generate ID
        Student savedStudent = studentRepo.save(student);

        // Generate roll number if not provided
        if (savedStudent.getRollNo() == null) {
            String rollNo = generateRollNo(
                    savedStudent.getYear() != 0 ? savedStudent.getYear() : 1,
                    savedStudent.getBranch() != null ? savedStudent.getBranch() : "GEN",
                    savedStudent.getId()
            );
            savedStudent.setRollNo(rollNo);
        }

        // Generate university ID if not provided
        if (savedStudent.getUnivId() == null) {
            savedStudent.setUnivId(generateUnivId(
                    savedStudent.getName(),
                    savedStudent.getContactNo() != null ? savedStudent.getContactNo() : 1234567890L
            ));
        }

        // Create Firebase user
        try {
            User user = service.createUser(
                    savedStudent.getEmail(),
                    savedStudent.getPassword(),
                    savedStudent.getName(),
                    "student",
                    savedStudent.getUnivId()
            );
            savedStudent.setFirebaseUid(user.getFirebaseUid());
        } catch (Exception e) {
            // If Firebase fails, delete the student record
            studentRepo.delete(savedStudent);
            throw new Exception("Failed to create Firebase user: " + e.getMessage());
        }

        return studentRepo.save(savedStudent);
    }



    public Faculty uploadFacultyDetail(Faculty faculty) throws Exception {

        Faculty savedFaculty =  facultyRepo.save(faculty);
        savedFaculty.setPassword(generatePassword(savedFaculty.getDob()));
        savedFaculty.setUnivId(generateUnivIdFaculty(savedFaculty.getName(),savedFaculty.getContactNo()));
        User user = service.createUser(savedFaculty.getEmail(),savedFaculty.getPassword(),savedFaculty.getName(),"faculty",savedFaculty.getUnivId());
        savedFaculty.setFirebaseUid(user.getFirebaseUid());
        return facultyRepo.save(savedFaculty);

    }

    public Optional<Student> getStudentByRollNo(String rollNo){

        return studentRepo.findByRollNo(rollNo);

    }

    public Student updateStudent(String rollNo, Student updatedStudent) {

        Optional<Student> optionalStudent = studentRepo.findByRollNo(rollNo);

        if (optionalStudent.isPresent()) {
            Student existingStudent = optionalStudent.get();

            existingStudent.setName(updatedStudent.getName());
            existingStudent.setCourse(updatedStudent.getCourse());
            existingStudent.setBranch(updatedStudent.getBranch());
            existingStudent.setSemester(updatedStudent.getSemester());
            existingStudent.setYear(updatedStudent.getYear());
            existingStudent.setEnrollmentCode(updatedStudent.getEnrollmentCode());
            existingStudent.setEnrollmentCompleted(updatedStudent.isEnrollmentCompleted());
            existingStudent.setRollNo(updatedStudent.getRollNo());
            existingStudent.setDob(updatedStudent.getDob());
            existingStudent.setContactNo(updatedStudent.getContactNo());
            existingStudent.setAddress(updatedStudent.getAddress());
            existingStudent.setGender(updatedStudent.getGender());
            existingStudent.setNationality(updatedStudent.getNationality());
            existingStudent.setBloodGroup(updatedStudent.getBloodGroup());
            existingStudent.setParentContactNo(updatedStudent.getParentContactNo());
            existingStudent.setParentName(updatedStudent.getParentName());
            existingStudent.setParentOccupation(updatedStudent.getParentOccupation());
            existingStudent.setEmail(updatedStudent.getEmail());
            existingStudent.setUnivId(updatedStudent.getUnivId());

            return studentRepo.save(existingStudent);
        }
        else{
            return null;
        }
    }

    public boolean deleteStudent(String rollNo) {

        Optional<Student> optionalStudent = getStudentByRollNo(rollNo);

        if (optionalStudent.isPresent()){
            Student existingStudent = optionalStudent.get();
            studentRepo.delete(existingStudent);
            return true;
        }
        else{
            return false;
        }

    }


    public Optional<Faculty> getFacultyByUnivId(String emailId){

        return facultyRepo.findByEmail(emailId);

    }

    public Faculty updateFaculty(String emailId, Faculty updatedFaculty) {

        Optional<Faculty> optionalFaculty = facultyRepo.findByEmail(emailId);

        if (optionalFaculty.isPresent()) {
            Faculty existingFaculty = optionalFaculty.get();

            existingFaculty.setName(updatedFaculty.getName());
            existingFaculty.setDob(updatedFaculty.getDob());
            existingFaculty.setContactNo(updatedFaculty.getContactNo());
            existingFaculty.setAddress(updatedFaculty.getAddress());
            existingFaculty.setGender(updatedFaculty.getGender());
            existingFaculty.setNationality(updatedFaculty.getNationality());
            existingFaculty.setBloodGroup(updatedFaculty.getBloodGroup());
            existingFaculty.setEmail(updatedFaculty.getEmail());


            return facultyRepo.save(existingFaculty);
        }
        else{
            return null;
        }
    }

    public boolean deleteFaculty(String emailId) {

        Faculty faculty = facultyRepo.findByEmail((emailId)).orElseThrow(() -> new RuntimeException("Faculty not found"));

        if (faculty != null){
            facultyRepo.delete(faculty);
            return true;
        }
        else {
            return false;
        }
    }


}
