package com.breeze.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import tools.jackson.databind.JacksonModule;
import tools.jackson.databind.module.SimpleModule;
import tools.jackson.databind.ser.std.ToStringSerializer;

/**
 * 全局 Long -> String 序列化。
 *
 * <p>雪花 ID 是 BIGINT,超出 JS 安全整数范围 (2^53),前端直接收 Long 会丢精度。
 * 这里对 Long 包装类型与 long 基本类型统一注册 ToStringSerializer,
 * Spring Boot 4 会自动收集所有 {@link JacksonModule} Bean 应用到全局 ObjectMapper。
 *
 * <p>注意(Spring Boot 4 / Jackson 3 踩点):
 * <ul>
 *   <li>包名从 {@code com.fasterxml.jackson.*} 迁移到 {@code tools.jackson.*}</li>
 *   <li>Module 基类从 Jackson 2 的 {@code ...databind.Module} 重命名为
 *       {@code tools.jackson.databind.JacksonModule}(避免与 {@code java.lang.Module} 冲突)</li>
 *   <li>用 {@code JacksonModule} Bean(而非自定义 ObjectMapper Bean),否则会关掉 SB 自动配置</li>
 * </ul>
 */
@Configuration
public class JsonConfig {

	@Bean
	public JacksonModule longToStringModule() {
		SimpleModule module = new SimpleModule("LongToString");
		module.addSerializer(Long.class, ToStringSerializer.instance);
		module.addSerializer(Long.TYPE, ToStringSerializer.instance);
		return module;
	}

}
