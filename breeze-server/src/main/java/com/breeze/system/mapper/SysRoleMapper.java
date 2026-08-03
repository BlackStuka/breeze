package com.breeze.system.mapper;

import com.breeze.system.entity.SysRole;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

	/** 逻辑删除:deleted 置为本行主键。 */
	@Update("UPDATE sys_role SET deleted = #{id} WHERE id = #{id} AND deleted = 0")
	int logicDelete(@Param("id") Long id);
}
