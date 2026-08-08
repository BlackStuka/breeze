package com.breeze.business.product.controller;

import com.breeze.business.product.dto.ProductResp;
import com.breeze.business.product.dto.ProductSaveRequest;
import com.breeze.business.product.service.ProductService;
import com.breeze.common.response.PageResult;
import com.breeze.common.response.Result;
import com.breeze.security.constant.Permissions;
import com.breeze.system.dto.PageQuery;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;

	@GetMapping
	@PreAuthorize("hasAuthority('" + Permissions.PRODUCT_LIST + "')")
	public Result<PageResult<ProductResp>> page(PageQuery pq, @RequestParam(required = false) String name) {
		return Result.success(productService.page(pq, name));
	}

	@PostMapping
	@PreAuthorize("hasAuthority('" + Permissions.PRODUCT_ADD + "')")
	public Result<Long> create(@RequestBody @Valid ProductSaveRequest req) {
		return Result.success(productService.create(req));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAuthority('" + Permissions.PRODUCT_EDIT + "')")
	public Result<Void> update(@PathVariable Long id, @RequestBody @Valid ProductSaveRequest req) {
		productService.update(id, req);
		return Result.success();
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('" + Permissions.PRODUCT_REMOVE + "')")
	public Result<Void> delete(@PathVariable Long id) {
		productService.delete(id);
		return Result.success();
	}
}
