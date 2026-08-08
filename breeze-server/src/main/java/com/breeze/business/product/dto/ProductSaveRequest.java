package com.breeze.business.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductSaveRequest(
		@NotBlank @Size(max = 128) String name,
		@NotBlank @Size(max = 64) @Pattern(regexp = "[A-Za-z][A-Za-z0-9_-]*", message = "产品编码格式无效") String code,
		@NotNull @DecimalMin(value = "0.00", message = "价格不能为负数") @Digits(integer = 10, fraction = 2, message = "价格最多 10 位整数和 2 位小数") BigDecimal price,
		@Min(0) @Max(1) Integer status,
		@Size(max = 500) String remark) {
}
