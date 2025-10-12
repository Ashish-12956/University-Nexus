package com.mayank.CampusCloudUniversityCampusSystem.service;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.mayank.CampusCloudUniversityCampusSystem.model.User;
import com.mayank.CampusCloudUniversityCampusSystem.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Component

public class UserService {


    @Autowired
    FirebaseAuth firebaseAuth;

    @Autowired
    UserRepo userRepo;
    @Transactional
    public User createUser(String email, String password, String name, String role,String univId) throws Exception {
        // 1. Create Firebase user

        try {
            UserRecord existingFirebaseUser = firebaseAuth.getUserByEmail(email);
            firebaseAuth.deleteUser(existingFirebaseUser.getUid());
            userRepo.findByEmail(email).ifPresent(user -> {
                userRepo.delete(user);});
        }
        catch (FirebaseAuthException e){
            System.out.println(e.getMessage());
        }
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(name)
                .setEmailVerified(true);

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);

        User user = new User();
        user.setFirebaseUid(userRecord.getUid());
        user.setEmail(email);
        user.setName(name);
        user.setUnivId(univId);
        user.setRole(role);

        return userRepo.save(user);
    }
}
