package com.breeze.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** 角色新增/修改。 */
public record RoleSaveRequest(
		@NotBlank @Size(max = 64) String roleName,
		@NotBlank @Size(max = 64) @Pattern(regexp = "[A-Za-z][A-Za-z0-9:_-]*", message = "角色编码格式无效") String roleCode,
		@Min(value = 0, message = "排序不能为负数") Integer sort,
		@Min(0) @Max(1) Integer status) {
}
