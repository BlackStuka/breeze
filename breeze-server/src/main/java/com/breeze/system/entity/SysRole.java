package com.breeze.system.entity;

import com.breeze.common.entity.BaseEntity;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Table(value = "sys_role", camelToUnderline = true)
public class SysRole extends BaseEntity {

	private String roleName;

	private String roleCode;

	private Integer sort;

	private Integer status;
}
