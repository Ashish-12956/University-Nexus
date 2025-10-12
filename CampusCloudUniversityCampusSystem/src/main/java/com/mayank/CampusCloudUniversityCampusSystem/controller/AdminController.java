package com.mayank.CampusCloudUniversityCampusSystem.controller;

import com.mayank.CampusCloudUniversityCampusSystem.model.Faculty;
import com.mayank.CampusCloudUniversityCampusSystem.model.Student;
import com.mayank.CampusCloudUniversityCampusSystem.service.AdminService;
import org.apache.tomcat.util.http.parser.HttpParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class AdminController {
    
    @Autowired
    private AdminService service;
    @PostMapping(value = "/uploadStudentDetails",consumes = "multipart/form-data")
    public ResponseEntity<?> uploadDetailsOfStudentsBulk (
            @RequestPart("file") MultipartFile file) throws Exception {

        return  ResponseEntity.ok(service.uploadDetailsOfStudentsBulk(file));
    }

    @PostMapping("/uploadStudent")
    public ResponseEntity<?> uploadStudentDetail(@RequestBody Student student) {
        try {
            // Add validation for required fields
            if (student.getName() == null || student.getName().isEmpty()) {
                return ResponseEntity.badRequest().body("Name is required");
            }
            if (student.getEmail() == null || student.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            Student student1 = service.uploadStudentDetail(student);
            return new ResponseEntity<>(student1, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping ("/uploadFaculty")
    public ResponseEntity <?> uploadFacultyDetail (@RequestBody Faculty faculty){

        try {
            Faculty faculty1 = service.uploadFacultyDetail (faculty);
            return new ResponseEntity <> (faculty1,HttpStatus.OK);
        }
        catch (Exception e){
            return new ResponseEntity <>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping("/student/{rollNo}")
    public ResponseEntity <?> getStudentByRollNo (@PathVariable String rollNo){

        try {
             Optional <Student> student = service.getStudentByRollNo(rollNo);
            return new ResponseEntity <>(student,HttpStatus.OK);
        }
        catch (Exception e){
            return new ResponseEntity<>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping ("/student/{rollNo}")
    public ResponseEntity <?> updateStudent(@RequestBody Student student , @PathVariable String rollNo){

        try {
            Student student1 = service.updateStudent (rollNo,student);
            return new ResponseEntity <>(student1,HttpStatus.OK);
        }
        catch (Exception e){
            return  new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/student/{rollNo}")
    public ResponseEntity <String> deleteStudent (@PathVariable String rollNo){

        if (service.deleteStudent(rollNo)){
            return new ResponseEntity<>("Deleted",HttpStatus.OK);
        }
        else{
            return new ResponseEntity<>("Student not found",HttpStatus.NOT_FOUND);
        }

    }

    @GetMapping("/faculty/{emailId}")
    public ResponseEntity <?> getFacultyByUnivId (@PathVariable String emailId){

        try {
            Optional <Faculty> faculty  = service.getFacultyByUnivId(emailId);
            return new ResponseEntity <>(faculty,HttpStatus.OK);
        }
        catch (Exception e){
            return new ResponseEntity<>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping ("/faculty/{emailId}")
    public ResponseEntity <?> updateFaculty (@RequestBody Faculty faculty,@PathVariable String emailId){

        try {
            Faculty faculty1 = service.updateFaculty (emailId,faculty);
            return new ResponseEntity <>(faculty1,HttpStatus.OK);
        }
        catch (Exception e){
            return  new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/faculty/{emailId}")
    public ResponseEntity <?> deleteFaculty (@PathVariable String emailId){

        try {
            boolean result =  service.deleteFaculty(emailId);
            return new ResponseEntity<>(result,HttpStatus.OK);
        }
        catch(Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
