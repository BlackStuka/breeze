package com.breeze.system.mapper;

import com.breeze.system.entity.SysUser;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

	/** 按用户名查(login 用)。@Select 原生 SQL 不走逻辑删除自动过滤,手动加 deleted=0。 */
	@Select("SELECT * FROM sys_user WHERE username = #{username} AND deleted = 0")
	SysUser selectByUsername(@Param("username") String username);

	/** 查用户所有权限字符串(user→启用角色→启用菜单的 perms,去重)。 */
	@Select("""
			SELECT DISTINCT m.perms
			FROM sys_user_role ur
			JOIN sys_role r ON ur.role_id = r.id
			JOIN sys_role_menu rm ON ur.role_id = rm.role_id
			JOIN sys_menu m ON rm.menu_id = m.id
			WHERE ur.user_id = #{userId}
			  AND r.status = 1 AND r.deleted = 0
			  AND m.perms IS NOT NULL AND m.perms <> ''
			  AND m.status = 1 AND m.deleted = 0
			""")
	List<String> selectPermsByUserId(@Param("userId") Long userId);

	/** 逻辑删除:deleted 置为本行主键(避开「逻辑删除+唯一索引」冲突)。 */
	@Update("UPDATE sys_user SET deleted = #{id} WHERE id = #{id} AND deleted = 0")
	int logicDelete(@Param("id") Long id);
}
