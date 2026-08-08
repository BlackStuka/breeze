package com.breeze.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserPasswordRequest(
		@NotBlank(message = "密码不能为空") @Size(min = 8, max = 72, message = "密码长度必须为 8-72 位") String password) {
}
