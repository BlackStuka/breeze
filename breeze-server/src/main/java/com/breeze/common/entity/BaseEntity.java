package com.breeze.common.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 实体基类:雪花 ID + 审计字段 + 逻辑删除。
 *
 * <p>createTime/updateTime 用 {@code @Column(onInsertValue="now()")}:insert 时由 DB now() 填充,
 * 因为 MyBatis-Flex insert 默认会带上 null 字段,而 V1 列是 NOT NULL DEFAULT —— 显式插 NULL 会让 DEFAULT 失效报错。
 * update 时靠 DB 的 ON UPDATE CURRENT_TIMESTAMP 自动刷新 update_time。
 * createBy/updateBy 由 InsertListener/UpdateListener 自动填充(security 层接入后),列允许 null。
 *
 * <p>逻辑删除:deleted 字段标 {@code @Column(isLogicDelete=true)},查询自动过滤 deleted=0。
 * 删除采用「deleted=id」方案(删除时把 deleted 置为本行主键,避开「逻辑删除+唯一索引」冲突),
 * 在 service 层显式 {@code update set deleted=id} 实现——不用 deleteById。
 */
@Data
public abstract class BaseEntity {

	@Id(keyType = KeyType.Generator, value = "snowFlakeId")
	private Long id;

	private Long createBy;

	@Column(onInsertValue = "now()")
	private LocalDateTime createTime;

	private Long updateBy;

	@Column(onInsertValue = "now()")
	private LocalDateTime updateTime;

	@Column(isLogicDelete = true)
	private Long deleted;
}
