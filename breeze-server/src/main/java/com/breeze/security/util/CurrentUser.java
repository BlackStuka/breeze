package com.breeze.security.util;

import com.breeze.security.LoginUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * 从 SecurityContext 取当前登录用户。
 */
public final class CurrentUser {

	private CurrentUser() {
	}

	public static LoginUser get() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof LoginUser lu) {
			return lu;
		}
		return null;
	}

	public static Long getUserId() {
		LoginUser lu = get();
		return lu == null ? null : lu.getUserId();
	}
}
