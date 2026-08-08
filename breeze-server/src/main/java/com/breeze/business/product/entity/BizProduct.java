package com.breeze.business.product.entity;

import com.breeze.common.entity.BaseEntity;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@Table(value = "biz_product", camelToUnderline = true)
public class BizProduct extends BaseEntity {

	private String name;

	private String code;

	private BigDecimal price;

	private Integer status;

	private String remark;
}
