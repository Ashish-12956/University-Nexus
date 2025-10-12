package com.mayank.CampusCloudUniversityCampusSystem.controller;

import com.mayank.CampusCloudUniversityCampusSystem.model.User;
import com.mayank.CampusCloudUniversityCampusSystem.service.AuthService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;

    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody TokenRequest tokenRequest) {
        try {
            User user = authService.verifyTokenAndGetUser(tokenRequest.getIdToken())
                    .orElseThrow(() -> new Exception("User not found in database"));

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("firebaseUid", user.getFirebaseUid());
            response.put("role", user.getRole());
            response.put("userUnivId",user.getUnivId());
            response.put("idToken", tokenRequest.getIdToken());

            String redirectUrl = switch (user.getRole().toLowerCase()) {
                case "admin" -> "/admin/dashboard";
                case "student" -> "/student/dashboard";
                case "faculty" -> "/teacher/dashboard";
                default -> throw new Exception("Unknown user role");
            };
            response.put("redirectUrl", redirectUrl);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }

    @Data
    static class TokenRequest {
        private String idToken;
    }
}