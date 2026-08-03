package com.breeze.system.controller;

import com.breeze.common.response.PageResult;
import com.breeze.common.response.Result;
import com.breeze.security.constant.Permissions;
import com.breeze.system.dto.PageQuery;
import com.breeze.system.dto.UserPasswordRequest;
import com.breeze.system.dto.UserResp;
import com.breeze.system.dto.UserSaveRequest;
import com.breeze.system.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping
	@PreAuthorize("hasAuthority('" + Permissions.USER_LIST + "')")
	public Result<PageResult<UserResp>> page(PageQuery pq, @RequestParam(required = false) String username) {
		return Result.success(userService.page(pq, username));
	}

	@PostMapping
	@PreAuthorize("hasAuthority('" + Permissions.USER_ADD + "')")
	public Result<Long> create(@RequestBody @Valid UserSaveRequest req) {
		return Result.success(userService.create(req));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAuthority('" + Permissions.USER_EDIT + "')")
	public Result<Void> update(@PathVariable Long id, @RequestBody @Valid UserSaveRequest req) {
		userService.update(id, req);
		return Result.success();
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('" + Permissions.USER_REMOVE + "')")
	public Result<Void> delete(@PathVariable Long id) {
		userService.delete(id);
		return Result.success();
	}

	@PutMapping("/{id}/password")
	@PreAuthorize("hasAuthority('" + Permissions.USER_RESET_PASSWORD + "')")
	public Result<Void> resetPassword(@PathVariable Long id, @RequestBody @Valid UserPasswordRequest req) {
		userService.resetPassword(id, req.password());
		return Result.success();
	}
}
