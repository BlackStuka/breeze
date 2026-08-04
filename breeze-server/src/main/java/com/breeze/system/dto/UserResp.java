package com.breeze.system.dto;

import java.time.LocalDateTime;
import java.util.List;

/** 用户响应(脱敏:不含 password/deleted)。 */
public record UserResp(
		Long id,
		String username,
		String nickname,
		String avatar,
		String email,
		String phone,
		Integer status,
		LocalDateTime createTime,
		List<Long> roleIds) {

	public static UserResp of(Long id, String username, String nickname, String avatar,
			String email, String phone, Integer status, LocalDateTime createTime, List<Long> roleIds) {
		return new UserResp(id, username, nickname, avatar, email, phone, status, createTime, roleIds);
	}
}
