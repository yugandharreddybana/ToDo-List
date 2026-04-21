package com.productivitysuite.security;

import com.productivitysuite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
            .map(u -> new org.springframework.security.core.userdetails.User(
                u.getId().toString(),
                u.getPasswordHash(),
                Collections.emptyList()
            ))
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public UserDetails loadUserById(UUID id) {
        return userRepository.findById(id)
            .map(u -> new org.springframework.security.core.userdetails.User(
                u.getId().toString(),
                u.getPasswordHash(),
                Collections.emptyList()
            ))
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + id));
    }
}
