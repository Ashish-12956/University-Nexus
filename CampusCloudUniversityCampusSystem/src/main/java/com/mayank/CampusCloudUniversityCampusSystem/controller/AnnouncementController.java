package com.mayank.CampusCloudUniversityCampusSystem.controller;

import com.mayank.CampusCloudUniversityCampusSystem.model.Announcement;
import com.mayank.CampusCloudUniversityCampusSystem.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class AnnouncementController {

    @Autowired
    AnnouncementService service;

        @PostMapping("/admin/announcement")
    public ResponseEntity<?> sendAnnouncement(@RequestBody Announcement announcement) {
        try {
            return new ResponseEntity<>(service.sendAnnouncement(announcement), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/announcement")
    public ResponseEntity<?> getAnnouncement() {
        try {
            Announcement announcement = service.getCurrentAnnouncement();
            if (announcement != null) {
                return new ResponseEntity<>(announcement, HttpStatus.OK);
            } else {
                return new ResponseEntity<>("No announcement found", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all/announcement")
    public ResponseEntity<?> getAllAnnouncement(){

            try {
                return new ResponseEntity<>(service.getAllAnnouncement(),HttpStatus.OK);
            }
            catch(Exception e){
                return new ResponseEntity<>(e.getMessage(),HttpStatus.NOT_FOUND);
            }
    }

    @DeleteMapping("/delete/Announcement/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id){
        try {
            service.deleteAnnouncement(id);
            return new ResponseEntity<>("Announcement deleted", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}