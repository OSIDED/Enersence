package com.volticon.energy.service;

import com.volticon.energy.dto.LoginRequest;
import com.volticon.energy.dto.SignupRequest;
import com.volticon.energy.entity.User;
import com.volticon.energy.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User signup(SignupRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            throw new IllegalArgumentException("Email already in use");
        });

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("user");
        return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return user;
    }

    public User googleSignIn(String email, String fullName) {
        // Only allow Gmail addresses for this flow
        if (email == null || !email.toLowerCase().endsWith("@gmail.com")) {
            throw new IllegalArgumentException("Google sign-in requires a Gmail address");
        }

        return userRepository.findByEmail(email).orElseGet(() -> {
            // Create a new user record for this Google account. Generate a random password and store its hash.
            String randomPassword = java.util.UUID.randomUUID().toString();
            User user = new User();
            user.setFullName(fullName != null && !fullName.isBlank() ? fullName : email);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(randomPassword));
            user.setRole("user");
            return userRepository.save(user);
        });
    }

    public Optional<User> getById(Long userId) {
        return userRepository.findById(userId);
    }
}
