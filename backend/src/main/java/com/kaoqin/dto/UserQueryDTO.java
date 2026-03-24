package com.kaoqin.dto;

import lombok.Data;

@Data
public class UserQueryDTO {

    private String username;
    private String name;
    private String department;
    private String role;
    private String status;
    private Integer page = 0;
    private Integer size = 10;
}
