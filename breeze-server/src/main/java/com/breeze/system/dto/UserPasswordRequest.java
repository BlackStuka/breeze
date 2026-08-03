package com.breeze.system.dto;

import jakarta.validation.constraints.NotBlank;

public record UserPasswordRequest(@NotBlank(message = "密码不能为空") String password) {
}
