import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src'),
		},
	},
	server: {
		proxy: {
			// dev 代理 /api 到后端 8080,免 CORS;生产需 nginx 反代或后端配 CORS
			'/api': { target: 'http://localhost:8080', changeOrigin: true },
		},
	},
	test: {
		environment: 'node',
	},
})
