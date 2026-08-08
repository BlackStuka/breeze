package com.breeze.business.product.mapper;

import com.breeze.business.product.entity.BizProduct;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BizProductMapper extends BaseMapper<BizProduct> {

	@Select("SELECT * FROM biz_product WHERE code = #{code} AND deleted = 0")
	BizProduct selectByCode(@Param("code") String code);

	@Update("UPDATE biz_product SET deleted = #{id} WHERE id = #{id} AND deleted = 0")
	int logicDelete(@Param("id") Long id);
}
