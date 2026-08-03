package com.breeze.system.entity;

import com.breeze.common.entity.BaseEntity;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Table(value = "sys_user", camelToUnderline = true)
public class SysUser extends BaseEntity {

	private String username;

	private String password;

	private String nickname;

	private String avatar;

	private String email;

	private String phone;

	private Integer status;
}
