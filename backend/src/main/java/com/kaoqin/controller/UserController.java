package com.kaoqin.controller;

import com.kaoqin.common.ApiResponse;
import com.kaoqin.common.PageResult;
import com.kaoqin.dto.UserDTO;
import com.kaoqin.dto.UserQueryDTO;
import com.kaoqin.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "用户的增删改查、状态管理、密码修改")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "查询用户列表", description = "分页查询用户列表，支持按条件筛选")
    public ApiResponse<PageResult<UserDTO>> listUsers(
            @Parameter(description = "查询条件") UserQueryDTO queryDTO,
            @Parameter(description = "分页参数") @PageableDefault(size = 10) Pageable pageable) {
        PageResult<UserDTO> result = userService.findUsers(queryDTO, pageable);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.isCurrentUser(#id, authentication)")
    @Operation(summary = "获取用户详情", description = "根据用户ID获取用户详细信息")
    public ApiResponse<UserDTO> getUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ApiResponse.success(user);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "创建用户", description = "创建新用户，仅管理员可操作")
    public ApiResponse<UserDTO> createUser(
            @Parameter(description = "用户信息") @Valid @RequestBody UserDTO userDTO) {
        UserDTO createdUser = userService.createUser(userDTO);
        return ApiResponse.success("创建成功", createdUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "更新用户", description = "更新用户信息，仅管理员可操作")
    public ApiResponse<UserDTO> updateUser(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @Parameter(description = "用户信息") @Valid @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        return ApiResponse.success("更新成功", updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "删除用户", description = "删除用户，仅管理员可操作")
    public ApiResponse<Void> deleteUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success("删除成功", null);
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN') or @userService.isCurrentUser(#id, authentication)")
    @Operation(summary = "修改密码", description = "修改用户密码")
    public ApiResponse<Void> changePassword(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @Parameter(description = "旧密码") @RequestParam String oldPassword,
            @Parameter(description = "新密码") @RequestParam String newPassword) {
        userService.changePassword(id, oldPassword, newPassword);
        return ApiResponse.success("密码修改成功", null);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "更新用户状态", description = "启用或禁用用户账号")
    public ApiResponse<UserDTO> updateStatus(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @Parameter(description = "状态(ACTIVE/INACTIVE)") @RequestParam String status) {
        UserDTO updatedUser = userService.updateStatus(id, status);
        return ApiResponse.success("状态更新成功", updatedUser);
    }
}
