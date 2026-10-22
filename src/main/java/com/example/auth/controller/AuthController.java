
package com.example.auth.controller;

import com.example.auth.entity.User;
import com.example.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.web.csrf.CsrfToken;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User savedUser = authService.register(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "Registration successful",
                            "id", savedUser.getId(),
                            "username", savedUser.getUsername(),
                            "email", savedUser.getEmail()
                    )
            );

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", ex.getMessage())
            );
        }
    }

    // Login: only ONE endpoint

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            User user = authService.login(
                    request.identifier(),
                    request.password()
            );

            HttpSession session = httpRequest.getSession(true);

            session.setAttribute("userId", user.getId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("email", user.getEmail());

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail()
            ));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error",
                            "Invalid username/email or password"
                    ));
        }
    }




    // Check the currently authenticated session
    @GetMapping("/me")
    public ResponseEntity<?> currentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("error", "Not logged in")
            );
        }

        return ResponseEntity.ok(
                Map.of(
                        "id", session.getAttribute("userId"),
                        "username", session.getAttribute("username"),
                        "email", session.getAttribute("email")
                )
        );
    }

    // clear
    // and invalidate the server-side session
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(
                Map.of("message", "Logout successful")
        );
    }

    public record LoginRequest(
            String identifier,
            String password
    ) {}

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> csrf(
            CsrfToken csrfToken
    ) {
        return ResponseEntity.ok(
                Map.of("token", csrfToken.getToken())
        );
    }
}
