
package com.example.auth.service;

import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(User user) {

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException(
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }

        if (user.getPhone() != null
                && !user.getPhone().isBlank()
                && userRepository.existsByPhone(user.getPhone())) {
            throw new IllegalArgumentException(
                    "Phone already exists"
            );
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }

    public User login(String identifier, String rawPassword) {

        User user = userRepository
                .findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid username/email or password"
                        )
                );

        if (!passwordEncoder.matches(
                rawPassword,
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Invalid username/email or password"
            );
        }

        return user;
    }
}
