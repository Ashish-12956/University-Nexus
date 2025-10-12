package com.mayank.CampusCloudUniversityCampusSystem.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.mayank.CampusCloudUniversityCampusSystem.model.User;
import com.mayank.CampusCloudUniversityCampusSystem.repository.UserRepo;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepo userRepository;

    public AuthService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    // Existing method (unchanged)
    public Optional<User> verifyTokenAndGetUser(String idToken) throws Exception {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            return userRepository.findByFirebaseUid(uid);
        } catch (Exception e) {
            throw new Exception("Invalid Firebase ID token");
        }
    }

    public void verifyTokenAndCheckAccess(String idToken, String requestedFirebaseUid) throws Exception {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String tokenFirebaseUid = decodedToken.getUid();

            User user = userRepository.findByFirebaseUid(tokenFirebaseUid)
                    .orElseThrow(() -> new Exception("User not found in database"));

            if (!user.getFirebaseUid().equals(requestedFirebaseUid)) {
                throw new Exception("Access denied: You can only access your own data");
            }

        } catch (Exception e) {
            throw new Exception("Access verification failed: " + e.getMessage());
        }
    }


}