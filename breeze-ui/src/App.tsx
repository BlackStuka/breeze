import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { router } from '@/router'
import { queryClient } from '@/lib/queryClient'

export default function App() {
	return (
		<ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
				<Toaster richColors position="top-center" />
			</QueryClientProvider>
		</ThemeProvider>
	)
}
