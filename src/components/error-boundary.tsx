// src/components/error-boundary.tsx
import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    state = { error: null as Error | null }

    static getDerivedStateFromError(error: Error) {
        return { error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('Uncaught error:', error, info)
    }

    render() {
        if (this.state.error) {
            return (
                <div className="grid min-h-screen place-items-center bg-background p-4 text-foreground">
                    <div className="max-w-md text-center">
                        <h1 className="text-lg font-semibold">Algo salió mal</h1>
                        <p className="mt-2 text-sm text-muted-foreground">{this.state.error.message}</p>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}