import type { ReactNode } from 'react'

interface Props {
	title: string
	description?: string
	actions?: ReactNode
}

export function PageHeader({ title, description, actions }: Props) {
	return (
		<div className="mb-4 flex items-center justify-between">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold">{title}</h1>
				{description && <p className="text-sm text-muted-foreground">{description}</p>}
			</div>
			{actions && <div className="flex items-center gap-2">{actions}</div>}
		</div>
	)
}
