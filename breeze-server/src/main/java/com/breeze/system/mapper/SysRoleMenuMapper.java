package com.breeze.system.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/** 角色-菜单关联(纯关联表,无实体,直接 SQL)。 */
@Mapper
public interface SysRoleMenuMapper {

	@Delete("DELETE FROM sys_role_menu WHERE role_id = #{roleId}")
	int deleteByRoleId(@Param("roleId") Long roleId);

	@Insert("""
			<script>
			INSERT INTO sys_role_menu(role_id, menu_id) VALUES
			<foreach collection='menuIds' item='mid' separator=','>
				(#{roleId}, #{mid})
			</foreach>
			</script>
			""")
	int insertBatch(@Param("roleId") Long roleId, @Param("menuIds") List<Long> menuIds);
}
