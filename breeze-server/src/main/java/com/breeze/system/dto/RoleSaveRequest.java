package com.breeze.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 角色新增/修改。 */
public record RoleSaveRequest(
		@NotBlank @Size(max = 64) String roleName,
		@NotBlank @Size(max = 64) String roleCode,
		Integer sort,
		Integer status) {
}
