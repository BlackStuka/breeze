package com.breeze.system.dto;

/** 通用分页参数。 */
public record PageQuery(Integer pageNum, Integer pageSize) {

	public int effectivePageNum() {
		return pageNum == null || pageNum < 1 ? 1 : pageNum;
	}

	public int effectivePageSize() {
		if (pageSize == null || pageSize < 1) {
			return 10;
		}
		return Math.min(pageSize, 100);
	}
}
