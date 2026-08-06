package com.breeze.system;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class RbacAuthorizationIT {

	@Container
	static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4")
			.withDatabaseName("breeze_test")
			.withUsername("breeze")
			.withPassword("breeze");

	@Autowired
	MockMvc mockMvc;

	@Autowired
	ObjectMapper objectMapper;

	@DynamicPropertySource
	static void datasourceProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
		registry.add("spring.datasource.username", MYSQL::getUsername);
		registry.add("spring.datasource.password", MYSQL::getPassword);
		registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
	}

	@Test
	void authenticationAndAuthorizationErrorsUseUnifiedJson() throws Exception {
		mockMvc.perform(get("/api/auth/me"))
				.andExpect(status().isUnauthorized())
				.andExpect(content().contentTypeCompatibleWith("application/json"))
				.andExpect(jsonPath("$.code", is(401)))
				.andExpect(jsonPath("$.message", is("未登录或 token 无效")))
				.andExpect(jsonPath("$.data").doesNotExist());

		mockMvc.perform(get("/api/auth/me").header("Authorization", bearer("not-a-valid-token")))
				.andExpect(status().isUnauthorized())
				.andExpect(content().contentTypeCompatibleWith("application/json"))
				.andExpect(jsonPath("$.code", is(401)))
				.andExpect(jsonPath("$.data").doesNotExist());

		String adminToken = login("admin", "admin123");
		String menuId = findMenuId(adminToken, "system:user:list");
		String roleId = jsonData(mockMvc.perform(post("/api/roles")
				.header("Authorization", bearer(adminToken))
				.contentType("application/json")
				.content("{\"roleName\":\"格式测试角色\",\"roleCode\":\"response_test_role\",\"sort\":99,\"status\":1}"))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString());
		mockMvc.perform(put("/api/roles/{id}/menus", roleId)
				.header("Authorization", bearer(adminToken))
				.contentType("application/json")
				.content("{\"menuIds\":[\"" + menuId + "\"]}"))
				.andExpect(status().isOk());
		String userToken = login("response_test_user", "TestPass!234");
		// The role assignment is verified by the existing RBAC flow; this assertion
		// ensures an authenticated user without role-management permission gets 403 JSON.
		mockMvc.perform(get("/api/roles").header("Authorization", bearer(userToken)))
				.andExpect(status().isForbidden())
				.andExpect(content().contentTypeCompatibleWith("application/json"))
				.andExpect(jsonPath("$.code", is(403)))
				.andExpect(jsonPath("$.message", is("没有权限")))
				.andExpect(jsonPath("$.data").doesNotExist());
	}

	@Test
	void lowPrivilegeUserFollowsRoleMenuAuthorizationImmediately() throws Exception {
		mockMvc.perform(get("/api/auth/me"))
				.andExpect(status().isUnauthorized());

		String adminToken = login("admin", "admin123");
		String menuId = findMenuId(adminToken, "system:user:list");

		String roleId = jsonData(mockMvc.perform(post("/api/roles")
				.header("Authorization", bearer(adminToken))
				.contentType("application/json")
				.content("""
						{"roleName":"测试授权角色","roleCode":"rbac_test_role","sort":99,"status":1}
						"""))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString());

		mockMvc.perform(get("/api/roles/{id}/menus", roleId)
				.header("Authorization", bearer(adminToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.menuIds", hasSize(0)));

		mockMvc.perform(put("/api/roles/{id}/menus", roleId)
				.header("Authorization", bearer(adminToken))
				.contentType("application/json")
				.content("{\"menuIds\":[\"" + menuId + "\"]}"))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/roles/{id}/menus", roleId)
				.header("Authorization", bearer(adminToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.menuIds", contains(menuId)));

		String userId = jsonData(mockMvc.perform(post("/api/users")
				.header("Authorization", bearer(adminToken))
				.contentType("application/json")
				.content("""
						{"username":"rbac_test_user","password":"TestPass!234","nickname":"测试用户","status":1,"roleIds":["%s"]}
						""".formatted(roleId)))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString());

		String userToken = login("rbac_test_user", "TestPass!234");
		mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(userToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.authorities", contains("system:user:list")));
		mockMvc.perform(get("/api/users").header("Authorization", bearer(userToken)))
				.andExpect(status().isOk());
		mockMvc.perform(get("/api/roles").header("Authorization", bearer(userToken)))
				.andExpect(status().isForbidden());

		mockMvc.perform(put("/api/roles/{id}/menus", roleId)
				.header("Authorization", bearer(adminToken))
				.contentType("application/json")
				.content("{\"menuIds\":[]}"))
				.andExpect(status().isOk());
		mockMvc.perform(get("/api/users").header("Authorization", bearer(userToken)))
				.andExpect(status().isForbidden());

		mockMvc.perform(put("/api/roles/{id}/menus", roleId)
				.header("Authorization", bearer(adminToken))
				.contentType("application/json")
				.content("{\"menuIds\":[\"" + menuId + "\"]}"))
				.andExpect(status().isOk());
		mockMvc.perform(get("/api/users").header("Authorization", bearer(userToken)))
				.andExpect(status().isOk());

		mockMvc.perform(delete("/api/users/{id}", userId)
				.header("Authorization", bearer(adminToken)))
				.andExpect(status().isOk());
		mockMvc.perform(delete("/api/roles/{id}", roleId)
				.header("Authorization", bearer(adminToken)))
				.andExpect(status().isOk());
	}

	private String login(String username, String password) throws Exception {
		String body = mockMvc.perform(post("/api/auth/login")
				.contentType("application/json")
				.content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		return objectMapper.readTree(body).path("data").path("token").asText();
	}

	private String findMenuId(String token, String perms) throws Exception {
		String body = mockMvc.perform(get("/api/menus")
				.header("Authorization", bearer(token)))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		for (JsonNode menu : objectMapper.readTree(body).path("data")) {
			if (perms.equals(menu.path("perms").asText())) {
				return menu.path("id").asText();
			}
		}
		throw new AssertionError("Seed menu not found: " + perms);
	}

	private String jsonData(String body) throws Exception {
		return objectMapper.readTree(body).path("data").asText();
	}

	private String bearer(String token) {
		return "Bearer " + token;
	}
}
