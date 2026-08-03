package com.breeze.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 菜单新增/修改。 */
public record MenuSaveRequest(
		Long parentId,
		@NotBlank @Size(max = 64) String menuName,
		@NotBlank String menuType, // M目录 C菜单 F按钮
		@Size(max = 255) String path,
		@Size(max = 255) String component,
		@Size(max = 128) String perms,
		@Size(max = 64) String icon,
		Integer sort,
		Integer visible,
		Integer status) {
}
