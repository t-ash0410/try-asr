import { WebSocketButton } from '~/app/websocket/button'
import { WebTransportButton } from '~/app/webtransport/button'
import type { Route } from './+types/home'

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Home() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            Recording
          </nav>
        </div>
        <div>
          <WebSocketButton />
        </div>
        <div>
          <WebTransportButton />
        </div>
      </div>
    </main>
  )
}
