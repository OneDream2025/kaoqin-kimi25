package com.kaoqin.config;

import com.kaoqin.entity.User;
import com.kaoqin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        initAdminUser();
    }

    public void initAdminUser() {
        // Check all users first
        List<User> allUsers = userRepository.findAll();
        log.info("Current users in database: {}", allUsers.size());
        for (User u : allUsers) {
            log.info("  - {}: {}", u.getId(), u.getUsername());
        }
        
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            String encodedPassword = passwordEncoder.encode("admin123");
            admin.setPassword(encodedPassword);
            admin.setName("管理员");
            admin.setEmail("admin@kaoqin.com");
            admin.setPhone("13800138000");
            admin.setDepartment("技术部");
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");

            User saved = userRepository.save(admin);
            log.info("初始化管理员账号完成: admin / admin123, ID: {}", saved.getId());
        } else {
            log.info("Admin user already exists");
        }
        
        // Check all users after save
        allUsers = userRepository.findAll();
        log.info("Users in database after init: {}", allUsers.size());
        for (User u : allUsers) {
            if (u != null) {
                log.info("  - {}: {}", u.getId(), u.getUsername());
            } else {
                log.info("  - NULL USER FOUND!");
            }
        }

        if (!userRepository.existsByUsername("zhangsan")) {
            User user = new User();
            user.setUsername("zhangsan");
            user.setPassword(passwordEncoder.encode("123456"));
            user.setName("张三");
            user.setEmail("zhangsan@kaoqin.com");
            user.setPhone("13800138001");
            user.setDepartment("技术部");
            user.setRole("USER");
            user.setStatus("ACTIVE");

            userRepository.save(user);
            log.info("初始化测试用户完成: zhangsan / 123456");
        }
    }
}
