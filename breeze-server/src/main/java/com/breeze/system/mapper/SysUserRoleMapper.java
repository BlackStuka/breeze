package com.breeze.system.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/** 用户-角色关联(纯关联表,无实体,直接 SQL)。 */
@Mapper
public interface SysUserRoleMapper {

	@Select("SELECT role_id FROM sys_user_role WHERE user_id = #{userId}")
	List<Long> selectRoleIdsByUserId(@Param("userId") Long userId);

	@Select("""
			<script>
			SELECT user_id, role_id FROM sys_user_role WHERE user_id IN
			<foreach collection='userIds' item='userId' open='(' separator=',' close=')'>
				#{userId}
			</foreach>
			</script>
			""")
	List<UserRoleRow> selectByUserIds(@Param("userIds") List<Long> userIds);

	@Delete("DELETE FROM sys_user_role WHERE user_id = #{userId}")
	int deleteByUserId(@Param("userId") Long userId);

	@Delete("DELETE FROM sys_user_role WHERE role_id = #{roleId}")
	int deleteByRoleId(@Param("roleId") Long roleId);

	@Insert("""
			<script>
			INSERT INTO sys_user_role(user_id, role_id) VALUES
			<foreach collection='roleIds' item='rid' separator=','>
				(#{userId}, #{rid})
			</foreach>
			</script>
			""")
	int insertBatch(@Param("userId") Long userId, @Param("roleIds") List<Long> roleIds);

	record UserRoleRow(Long userId, Long roleId) {
	}
}
