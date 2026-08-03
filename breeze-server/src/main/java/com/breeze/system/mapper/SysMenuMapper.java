package com.breeze.system.mapper;

import com.breeze.system.entity.SysMenu;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface SysMenuMapper extends BaseMapper<SysMenu> {

	/** 查用户可见的菜单(目录/菜单,不含按钮),用于动态菜单树。 */
	@Select("""
			SELECT DISTINCT m.*
			FROM sys_user_role ur
			JOIN sys_role_menu rm ON ur.role_id = rm.role_id
			JOIN sys_menu m ON rm.menu_id = m.id
			WHERE ur.user_id = #{userId}
			  AND m.status = 1
			  AND m.visible = 1
			  AND m.deleted = 0
			  AND m.menu_type IN ('M', 'C')
			ORDER BY m.sort
			""")
	List<SysMenu> selectMenusByUserId(@Param("userId") Long userId);

	/** 逻辑删除:deleted 置为本行主键。 */
	@Update("UPDATE sys_menu SET deleted = #{id} WHERE id = #{id} AND deleted = 0")
	int logicDelete(@Param("id") Long id);
}
