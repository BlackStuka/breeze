package com.breeze.system.dto;

import java.util.List;

/** 角色分配菜单(全量覆盖:传当前角色应拥有的全部菜单 ID)。 */
public record RoleMenuAssignRequest(List<Long> menuIds) {
}
