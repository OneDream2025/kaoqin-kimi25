package com.kaoqin.controller;

import com.kaoqin.common.Result;
import com.kaoqin.entity.User;
import com.kaoqin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        users.forEach(user -> user.setPassword(null));
        return Result.success(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public Result<User> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(user -> {
                    user.setPassword(null);
                    return Result.success(user);
                })
                .orElse(Result.error(404, "用户不存在"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<User> createUser(@RequestBody User user) {
        try {
            User savedUser = userService.create(user);
            savedUser.setPassword(null);
            return Result.success("用户创建成功", savedUser);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.update(id, userDetails);
            updatedUser.setPassword(null);
            return Result.success("用户更新成功", updatedUser);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return Result.success("用户删除成功", null);
    }
}
