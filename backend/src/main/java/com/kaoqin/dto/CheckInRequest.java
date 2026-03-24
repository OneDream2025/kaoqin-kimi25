package com.kaoqin.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class CheckInRequest {

    @NotNull(message = "打卡类型不能为空")
    private CheckInType type;

    private String location;
    private String remark;

    public enum CheckInType {
        CHECK_IN,   // 上班打卡
        CHECK_OUT   // 下班打卡
    }
}
