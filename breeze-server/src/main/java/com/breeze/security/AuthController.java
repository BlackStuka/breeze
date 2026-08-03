package com.breeze.security;

import com.breeze.common.exception.BusinessException;
import com.breeze.common.response.Result;
import com.breeze.security.dto.LoginRequest;
import com.breeze.security.jwt.JwtService;
import com.breeze.security.util.CurrentUser;
import com.breeze.system.entity.SysUser;
import com.breeze.system.mapper.SysUserMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 认证入口(放 security 包,依赖单向 security→system,避免循环)。
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final SysUserMapper sysUserMapper;
	private final JwtService jwtService;
	private final PasswordEncoder passwordEncoder;

	@PostMapping("/login")
	public Result<Map<String, String>> login(@RequestBody @Valid LoginRequest req) {
		SysUser user = sysUserMapper.selectByUsername(req.username());
		if (user == null || user.getStatus() == null || user.getStatus() != 1
				|| !passwordEncoder.matches(req.password(), user.getPassword())) {
			throw new BusinessException(401, "用户名或密码错误");
		}
		String token = jwtService.issue(user.getId());
		return Result.success(Map.of("token", token));
	}

	@PostMapping("/logout")
	public Result<Void> logout() {
		// 无状态 JWT:前端丢弃 token 即可,服务端无需登记
		return Result.success();
	}

	@GetMapping("/me")
	public Result<Map<String, Object>> me() {
		LoginUser lu = CurrentUser.get();
		if (lu == null) {
			throw new BusinessException(401, "未登录");
		}
		SysUser user = sysUserMapper.selectOneById(lu.getUserId());
		if (user == null) {
			throw new BusinessException(401, "用户不存在");
		}
		Map<String, Object> info = new LinkedHashMap<>();
		info.put("userId", lu.getUserId());
		info.put("username", lu.getUsername());
		info.put("nickname", user.getNickname());
		info.put("avatar", user.getAvatar());
		info.put("authorities", lu.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
		return Result.success(info);
	}
}
