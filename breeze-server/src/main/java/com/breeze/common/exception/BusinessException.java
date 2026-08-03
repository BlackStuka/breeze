package com.breeze.common.exception;

import lombok.Getter;

/**
 * 业务异常。code 会被 GlobalExceptionHandler 映射到对应 HTTP 状态。
 */
@Getter
public class BusinessException extends RuntimeException {

	private final int code;

	public BusinessException(int code, String message) {
		super(message);
		this.code = code;
	}

	/** 默认 400。 */
	public BusinessException(String message) {
		this(400, message);
	}
}
