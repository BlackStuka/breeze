package com.breeze.business.product.service;

import com.breeze.business.product.dto.ProductResp;
import com.breeze.business.product.dto.ProductSaveRequest;
import com.breeze.business.product.entity.BizProduct;
import com.breeze.business.product.mapper.BizProductMapper;
import com.breeze.common.exception.BusinessException;
import com.breeze.common.response.PageResult;
import com.breeze.system.dto.PageQuery;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

	private final BizProductMapper productMapper;

	public PageResult<ProductResp> page(PageQuery pq, String name) {
		QueryWrapper query = QueryWrapper.create();
		if (name != null && !name.isBlank()) {
			query.and(BizProduct::getName).like(name);
		}
		query.orderBy(BizProduct::getCreateTime, false);
		Page<BizProduct> page = productMapper.paginate(pq.effectivePageNum(), pq.effectivePageSize(), query);
		List<ProductResp> records = page.getRecords().stream().map(this::toResp).toList();
		return PageResult.of(records, page.getTotalRow(), (int) page.getPageNumber(), (int) page.getPageSize());
	}

	public Long create(ProductSaveRequest req) {
		validateCode(req.code(), null);
		BizProduct product = new BizProduct();
		apply(req, product);
		productMapper.insert(product);
		return product.getId();
	}

	public void update(Long id, ProductSaveRequest req) {
		BizProduct product = requireProduct(id);
		validateCode(req.code(), id);
		apply(req, product);
		productMapper.update(product);
	}

	@Transactional
	public void delete(Long id) {
		requireProduct(id);
		productMapper.logicDelete(id);
	}

	private BizProduct requireProduct(Long id) {
		BizProduct product = productMapper.selectOneById(id);
		if (product == null) {
			throw new BusinessException(404, "产品不存在");
		}
		return product;
	}

	private void validateCode(String code, Long currentId) {
		BizProduct existing = productMapper.selectByCode(code);
		if (existing != null && !existing.getId().equals(currentId)) {
			throw new BusinessException(409, "产品编码已存在");
		}
	}

	private void apply(ProductSaveRequest req, BizProduct product) {
		product.setName(req.name());
		product.setCode(req.code());
		product.setPrice(req.price());
		product.setStatus(req.status() == null ? 1 : req.status());
		product.setRemark(req.remark());
	}

	private ProductResp toResp(BizProduct product) {
		return new ProductResp(String.valueOf(product.getId()), product.getName(), product.getCode(),
				product.getPrice(), product.getStatus(), product.getRemark(), product.getCreateTime());
	}
}
