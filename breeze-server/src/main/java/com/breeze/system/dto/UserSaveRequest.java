package com.breeze.system.dto;

import jakarta.validation.constraints.Size;

import java.util.List;

/** 用户新增/修改。password 仅新增时使用;改密走专门的 reset 接口。 */
public record UserSaveRequest(
		@Size(max = 64) String username,
		@Size(min = 8, max = 72, message = "密码长度必须为 8-72 位") String password,
		@Size(max = 64) String nickname,
		@Size(max = 128) String email,
		@Size(max = 32) String phone,
		Integer status,
		List<Long> roleIds) {
}
