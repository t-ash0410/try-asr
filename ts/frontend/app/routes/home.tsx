import { VoiceRecognitionPanel } from '~/app/websocket/VoiceRecognitionPanel'
// import { WebTransportButton } from '~/app/webtransport/button'
import type { Route } from './+types/home'

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Voice Recognition Demo' },
    { name: 'description', content: 'Cyberpunk-style voice recognition demo' },
  ]
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-8">
          <header className="w-full max-w-3xl">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-lg blur opacity-25" />
              <div className="relative bg-card rounded-lg border border-border/50 backdrop-blur-xl p-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  音声認識デモ
                </h1>
                <p className="mt-2 text-muted-foreground">
                  未来的な音声認識システムを体験してください
                </p>
              </div>
            </div>
          </header>
          <section className="w-full max-w-3xl">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary via-accent to-primary rounded-lg blur opacity-25" />
              <div className="relative bg-card rounded-lg border border-border/50 backdrop-blur-xl p-8">
                <VoiceRecognitionPanel />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
