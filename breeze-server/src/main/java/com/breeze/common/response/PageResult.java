package com.breeze.common.response;

import java.util.List;

/** 通用分页响应。 */
public record PageResult<T>(List<T> records, long total, int current, int size) {

	public static <T> PageResult<T> of(List<T> records, long total, int current, int size) {
		return new PageResult<>(records, total, current, size);
	}
}
