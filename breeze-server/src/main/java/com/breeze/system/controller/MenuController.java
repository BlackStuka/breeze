package com.breeze.system.controller;

import com.breeze.common.response.Result;
import com.breeze.security.constant.Permissions;
import com.breeze.security.util.CurrentUser;
import com.breeze.system.dto.MenuSaveRequest;
import com.breeze.system.dto.MenuTreeNode;
import com.breeze.system.entity.SysMenu;
import com.breeze.system.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

	private final MenuService menuService;

	/** 当前登录用户的动态菜单树(登录即可访问,按权限过滤)。 */
	@GetMapping("/tree")
	public Result<List<MenuTreeNode>> currentUserTree() {
		return Result.success(menuService.currentUserMenuTree(CurrentUser.getUserId()));
	}

	/** 全部菜单平铺(管理用)。 */
	@GetMapping
	@PreAuthorize("hasAuthority('" + Permissions.MENU_LIST + "')")
	public Result<List<SysMenu>> list() {
		return Result.success(menuService.list());
	}

	@PostMapping
	@PreAuthorize("hasAuthority('" + Permissions.MENU_ADD + "')")
	public Result<Long> create(@RequestBody @Valid MenuSaveRequest req) {
		return Result.success(menuService.create(req));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAuthority('" + Permissions.MENU_EDIT + "')")
	public Result<Void> update(@PathVariable Long id, @RequestBody @Valid MenuSaveRequest req) {
		menuService.update(id, req);
		return Result.success();
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('" + Permissions.MENU_REMOVE + "')")
	public Result<Void> delete(@PathVariable Long id) {
		menuService.delete(id);
		return Result.success();
	}
}
