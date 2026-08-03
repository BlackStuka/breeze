package com.breeze.system.controller;

import com.breeze.common.response.PageResult;
import com.breeze.common.response.Result;
import com.breeze.security.constant.Permissions;
import com.breeze.system.dto.PageQuery;
import com.breeze.system.dto.RoleMenuAssignRequest;
import com.breeze.system.dto.RoleSaveRequest;
import com.breeze.system.entity.SysRole;
import com.breeze.system.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

	private final RoleService roleService;

	@GetMapping
	@PreAuthorize("hasAuthority('" + Permissions.ROLE_LIST + "')")
	public Result<PageResult<SysRole>> page(PageQuery pq, @RequestParam(required = false) String roleName) {
		return Result.success(roleService.page(pq, roleName));
	}

	@GetMapping("/options")
	@PreAuthorize("hasAuthority('" + Permissions.ROLE_LIST + "')")
	public Result<List<SysRole>> options() {
		return Result.success(roleService.options());
	}

	@PostMapping
	@PreAuthorize("hasAuthority('" + Permissions.ROLE_ADD + "')")
	public Result<Long> create(@RequestBody @Valid RoleSaveRequest req) {
		return Result.success(roleService.create(req));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAuthority('" + Permissions.ROLE_EDIT + "')")
	public Result<Void> update(@PathVariable Long id, @RequestBody @Valid RoleSaveRequest req) {
		roleService.update(id, req);
		return Result.success();
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('" + Permissions.ROLE_REMOVE + "')")
	public Result<Void> delete(@PathVariable Long id) {
		roleService.delete(id);
		return Result.success();
	}

	/** 分配菜单(全量覆盖)。 */
	@PutMapping("/{id}/menus")
	@PreAuthorize("hasAuthority('" + Permissions.ROLE_EDIT + "')")
	public Result<Void> assignMenus(@PathVariable Long id, @RequestBody @Valid RoleMenuAssignRequest req) {
		roleService.assignMenus(id, req.menuIds());
		return Result.success();
	}
}
