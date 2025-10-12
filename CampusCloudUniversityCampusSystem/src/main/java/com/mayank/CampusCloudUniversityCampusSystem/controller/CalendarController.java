package com.mayank.CampusCloudUniversityCampusSystem.controller;

import com.mayank.CampusCloudUniversityCampusSystem.model.Calendar;
import com.mayank.CampusCloudUniversityCampusSystem.service.CalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin
public class CalendarController {

    @Autowired
    private CalendarService calendarService;

    @GetMapping
    public ResponseEntity<?> getLatestCalendar() {
        try {
            Calendar calendar = calendarService.getLatestCalendar();
            if (calendar == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + calendar.getFileName() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(calendar.getFileData());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching calendar");
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadCalendar(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title) {
        try {
            if (file.isEmpty() || !file.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Invalid PDF file");
            }

            Calendar calendar = calendarService.saveCalendar(file, title);
            return ResponseEntity.ok("Calendar updated successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating calendar");
        }
    }
}