package com.breeze.security.config;

import com.breeze.common.entity.BaseEntity;
import com.breeze.security.util.CurrentUser;
import com.mybatisflex.core.FlexGlobalConfig;
import com.mybatisflex.spring.boot.MyBatisFlexCustomizer;
import org.springframework.stereotype.Component;

/**
 * 为所有 BaseEntity 实体自动填充当前操作人。
 *
 * <p>监听器注册在 security 模块，避免 common 反向依赖 SecurityContext；
 * 未登录场景(例如 Flyway 或系统任务)保留 null。
 */
@Component
public class AuditMybatisFlexCustomizer implements MyBatisFlexCustomizer {

	@Override
	public void customize(FlexGlobalConfig globalConfig) {
		globalConfig.registerInsertListener(entity -> {
			if (entity instanceof BaseEntity baseEntity) {
				Long userId = CurrentUser.getUserId();
				if (userId != null) {
					baseEntity.setCreateBy(userId);
					baseEntity.setUpdateBy(userId);
				}
			}
		}, BaseEntity.class);

		globalConfig.registerUpdateListener(entity -> {
			if (entity instanceof BaseEntity baseEntity) {
				Long userId = CurrentUser.getUserId();
				if (userId != null) {
					baseEntity.setUpdateBy(userId);
				}
			}
		}, BaseEntity.class);
	}
}
