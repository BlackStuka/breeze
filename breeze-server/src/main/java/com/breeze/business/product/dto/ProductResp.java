package com.breeze.business.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResp(
		String id,
		String name,
		String code,
		BigDecimal price,
		Integer status,
		String remark,
		LocalDateTime createTime) {
}
