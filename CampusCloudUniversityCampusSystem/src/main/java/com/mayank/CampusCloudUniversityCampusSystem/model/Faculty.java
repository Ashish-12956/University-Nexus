    package com.mayank.CampusCloudUniversityCampusSystem.model;

    import com.fasterxml.jackson.annotation.JsonIdentityInfo;
    import com.fasterxml.jackson.annotation.JsonIgnore;
    import com.fasterxml.jackson.annotation.JsonManagedReference;
    import com.fasterxml.jackson.annotation.ObjectIdGenerators;
    import jakarta.persistence.*;
    import jakarta.validation.constraints.Email;
    import lombok.*;

    import java.time.LocalDate;
    import java.util.List;

    @Data
    @Entity
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
    public class Faculty {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        private String name;

        @Column(nullable = true,unique = true,name="univ_id")
        private String univId;

        @Column(nullable = true, unique = true)
        private String firebaseUid;

        private String department;

        @Email
        @Column(unique = true,name = "email")
        private String email;

        private LocalDate dob;
        private long contactNo;
        private String address;
        private String gender;
        @Column(nullable = true)
        private String nationality;
        @Column(nullable = true)
        private String bloodGroup;

        @Lob
        @Column(name = "image", columnDefinition = "LONGBLOB")
        private byte[] image;

        @OneToMany(mappedBy = "faculty")
        private List<SubjectEnrollment> taughtSubjects;

        // One-to-Many with Attendance (attendance records marked by this faculty)
        @OneToMany(mappedBy = "faculty")
        @JsonIgnore
        public List<Attendance> markedAttendances;

        @Column(nullable = true)
        private String password;

    }
