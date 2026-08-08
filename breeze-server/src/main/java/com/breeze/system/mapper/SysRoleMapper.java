package com.breeze.system.mapper;

import com.breeze.system.entity.SysRole;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

	@Select("SELECT * FROM sys_role WHERE role_code = #{roleCode} AND deleted = 0")
	SysRole selectByRoleCode(@Param("roleCode") String roleCode);

	/** 逻辑删除:deleted 置为本行主键。 */
	@Update("UPDATE sys_role SET deleted = #{id} WHERE id = #{id} AND deleted = 0")
	int logicDelete(@Param("id") Long id);
}
