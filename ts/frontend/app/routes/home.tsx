import { VoiceRecognitionPanel } from '~/app/websocket/VoiceRecognitionPanel'
// import { WebTransportButton } from '~/app/webtransport/button'
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
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0 max-w-2xl mx-auto px-4">
        <nav className="w-full rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <h1 className="text-xl font-bold">音声認識デモ</h1>
        </nav>
        <div className="w-full">
          <VoiceRecognitionPanel />
        </div>
        {/* <div>
          <WebTransportButton />
        </div> */}
      </div>
    </main>
  )
}
