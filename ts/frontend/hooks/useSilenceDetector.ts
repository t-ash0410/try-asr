// hooks/useSilenceDetector.ts
import { useCallback, useEffect, useRef } from 'react'
import type {
  SilenceDetectorHookReturn,
  SilenceDetectorOptions,
} from '~/types/silenceDetector'

class SilenceDetector {
  private audioContext: AudioContext
  private analyser: AnalyserNode
  private readonly threshold: number
  private readonly silenceTime: number
  private readonly bufferLength: number
  private readonly dataArray: Float32Array
  private isSilent: boolean
  private isStopped: boolean
  private silenceStart: number
  private stream: MediaStream | null

  onSilenceStart?: () => void
  onSilenceEnd?: () => void
  onRestart?: () => void

  constructor(options: SilenceDetectorOptions) {
    this.audioContext = new AudioContext()
    this.analyser = this.audioContext.createAnalyser()
    this.threshold = options.threshold ?? -50
    this.silenceTime = options.silenceTime ?? 0.5

    this.analyser.fftSize = 2048
    this.bufferLength = this.analyser.frequencyBinCount
    this.dataArray = new Float32Array(this.bufferLength)

    this.isSilent = false
    this.isStopped = false
    this.silenceStart = 0
    this.stream = null
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const source = this.audioContext.createMediaStreamSource(this.stream)
    source.connect(this.analyser)
    this.checkSilence()
  }

  stop(): void {
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop()
      }
      this.stream = null
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
  }

  private checkSilence = (): void => {
    if (!this.stream) return

    this.analyser.getFloatTimeDomainData(this.dataArray)

    const rms = Math.sqrt(
      this.dataArray.reduce((acc, val) => acc + val * val, 0) /
        this.bufferLength,
    )

    const db = 20 * Math.log10(rms)

    if (db < this.threshold) {
      if (!this.isSilent) {
        this.isSilent = true
        this.silenceStart = Date.now()
        this.onSilenceStart?.()
      } else if (
        Date.now() - this.silenceStart > this.silenceTime * 1000 &&
        !this.isStopped
      ) {
        this.onSilenceEnd?.()
        this.isStopped = true
      }
    } else {
      if (this.isSilent) {
        this.isSilent = false
      }
      if (this.isStopped) {
        this.onRestart?.()
        this.isStopped = false
      }
    }
    requestAnimationFrame(this.checkSilence)
  }
}

const useSilenceDetector = (
  options: SilenceDetectorOptions = {},
): SilenceDetectorHookReturn => {
  const detectorRef = useRef<SilenceDetector | null>(null)

  const createDetector = useCallback(() => {
    const ret = new SilenceDetector(options)
    ret.onSilenceStart = options.onSilenceStart
    ret.onSilenceEnd = options.onSilenceEnd
    ret.onRestart = options.onRestart
    return ret
  }, [options])

  const startListening = useCallback(async () => {
    if (!detectorRef.current) {
      detectorRef.current = createDetector()
    }

    await detectorRef.current.start()
  }, [createDetector])

  const stopListening = useCallback(() => {
    if (detectorRef.current) {
      detectorRef.current.stop()
      detectorRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (detectorRef.current) {
        stopListening()
      }
    }
  }, [stopListening])

  return {
    startListening,
    stopListening,
  }
}

export default useSilenceDetector
