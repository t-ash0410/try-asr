export interface SilenceDetectorOptions {
  threshold?: number
  silenceTime?: number
  onSilenceStart?: () => void
  onSilenceEnd?: () => void
}

export interface SilenceDetectorHookReturn {
  startListening: () => Promise<void>
  stopListening: () => void
}
