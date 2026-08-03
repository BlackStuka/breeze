package com.breeze.common.exception;

import com.breeze.common.response.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理:统一转成 {@link Result}。
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<Result<Void>> handleBusiness(BusinessException e) {
		HttpStatus status = switch (e.getCode()) {
			case 401 -> HttpStatus.UNAUTHORIZED;
			case 403 -> HttpStatus.FORBIDDEN;
			case 404 -> HttpStatus.NOT_FOUND;
			default -> HttpStatus.BAD_REQUEST;
		};
		return ResponseEntity.status(status).body(Result.error(e.getCode(), e.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Result<Void>> handleValidation(MethodArgumentNotValidException e) {
		String message = e.getBindingResult().getFieldErrors().stream()
				.findFirst()
				.map(fe -> fe.getField() + " " + fe.getDefaultMessage())
				.orElse("参数校验失败");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Result.error(400, message));
	}

	/** RBAC 权限不足。 */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Result<Void>> handleAccessDenied(AccessDeniedException e) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Result.error(403, "没有权限"));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Result<Void>> handleOther(Exception e) {
		log.error("unhandled error", e);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Result.error(500, "服务器内部错误"));
	}
}
