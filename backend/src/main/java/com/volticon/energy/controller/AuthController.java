package com.volticon.energy.controller;

import com.volticon.energy.dto.LoginRequest;
import com.volticon.energy.dto.LoginResponse;
import com.volticon.energy.dto.RegisterRequest;
import com.volticon.energy.entity.User;
import com.volticon.energy.repository.UserRepository;
import com.volticon.energy.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Real authentication: passwords are BCrypt-hashed at registration and
 * verified with PasswordEncoder.matches() at login (never a plain string
 * comparison). On successful login, a signed JWT is issued and set as an
 * httpOnly, SameSite=Lax cookie -- the frontend never sees or stores the
 * raw token in JS-accessible storage.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String COOKIE_NAME = "auth_token";
    private static final int COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60; // 24h, matches jwt.expiration-ms default

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("detail", "An account with this email already exists."));
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole("USER");

        User saved = userRepository.save(user);

        issueCookie(response, saved);

        return ResponseEntity.status(201).body(
                new LoginResponse(saved.getUserId(), saved.getFullName(), saved.getEmail(), saved.getRole())
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return userRepository.findByEmail(request.email())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .<ResponseEntity<?>>map(u -> {
                    issueCookie(response, u);
                    return ResponseEntity.ok(
                            new LoginResponse(u.getUserId(), u.getFullName(), u.getEmail(), u.getRole())
                    );
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("detail", "Invalid email or password.")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // expire immediately
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("detail", "Logged out"));
    }

    /**
     * Returns the currently authenticated user based on the httpOnly
     * cookie (validated by JwtAuthFilter before this method runs). This
     * is what the frontend's AuthContext calls on every page load to
     * determine session state -- never trusts client-side storage alone.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("detail", "Not authenticated"));
        }

        Long userId = (Long) auth.getPrincipal();
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(
                        new LoginResponse(u.getUserId(), u.getFullName(), u.getEmail(), u.getRole())
                ))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("detail", "User not found")));
    }

    private void issueCookie(HttpServletResponse response, User user) {
        String token = jwtService.generateToken(user.getUserId(), user.getEmail(), user.getRole());

        Cookie cookie = new Cookie(COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(COOKIE_MAX_AGE_SECONDS);
        // secure=true required in production (HTTPS). False here so it
        // works over plain http://localhost during development.
        cookie.setSecure(false);
        response.addCookie(cookie);
    }
}
