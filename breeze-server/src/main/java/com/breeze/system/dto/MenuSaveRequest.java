package com.breeze.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** 菜单新增/修改。 */
public record MenuSaveRequest(
		@Min(value = 0, message = "父菜单 ID 无效") Long parentId,
		@NotBlank @Size(max = 64) String menuName,
		@NotBlank @Pattern(regexp = "[MCF]", message = "菜单类型无效") String menuType, // M目录 C菜单 F按钮
		@Size(max = 255) String path,
		@Size(max = 255) String component,
		@Size(max = 128) String perms,
		@Size(max = 64) String icon,
		@Min(value = 0, message = "排序不能为负数") Integer sort,
		@Min(0) @Max(1) Integer visible,
		@Min(0) @Max(1) Integer status) {
}
