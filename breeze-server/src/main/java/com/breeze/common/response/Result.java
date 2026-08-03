package com.breeze.common.response;

/**
 * 统一响应体。code=0 表成功,非 0 表业务错误码。
 */
public record Result<T>(int code, String message, T data) {

	public static <T> Result<T> success() {
		return new Result<>(0, "ok", null);
	}

	public static <T> Result<T> success(T data) {
		return new Result<>(0, "ok", data);
	}

	public static <T> Result<T> error(int code, String message) {
		return new Result<>(code, message, null);
	}
}
