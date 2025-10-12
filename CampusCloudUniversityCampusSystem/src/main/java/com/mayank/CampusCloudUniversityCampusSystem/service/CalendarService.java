package com.mayank.CampusCloudUniversityCampusSystem.service;

import com.mayank.CampusCloudUniversityCampusSystem.model.Calendar;
import com.mayank.CampusCloudUniversityCampusSystem.repository.CalendarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class CalendarService {

    @Autowired
    private CalendarRepository calendarRepository;

    public Calendar getLatestCalendar() {
        return calendarRepository.findFirstByOrderByLastUpdatedDesc().orElse(null);
    }

    @Transactional
    public Calendar saveCalendar(MultipartFile file, String title) throws IOException {
        Calendar calendar = new Calendar();
        calendar.setTitle(title);
        calendar.setFileName(file.getOriginalFilename());
        calendar.setFileData(file.getBytes());
        calendar.setLastUpdated(LocalDateTime.now());

        return calendarRepository.save(calendar);
    }
}