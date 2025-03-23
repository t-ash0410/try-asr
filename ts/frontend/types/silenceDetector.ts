export interface SilenceDetectorOptions {
  threshold?: number
  silenceTime?: number
  onSilenceStart?: () => void
  onSilenceEnd?: () => void
  onRestart?: () => void
}

export interface SilenceDetectorHookReturn {
  startListening: () => Promise<void>
  stopListening: () => void
}
