/**
 * Synthesised applause — no audio asset required. Builds a cheering crowd from
 * many short, band-passed noise bursts ("claps") layered over a soft swell,
 * all via the Web Audio API. Silently no-ops if audio can't be created
 * (e.g. autoplay policy before any user gesture — but we call it on a click).
 */
export function playApplause(durationMs = 2600) {
  type AC = typeof AudioContext
  const Ctx: AC | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext
  if (!Ctx) return

  let ctx: AudioContext
  try {
    ctx = new Ctx()
  } catch {
    return
  }

  const now = ctx.currentTime
  const duration = durationMs / 1000
  const master = ctx.createGain()
  master.gain.value = 0.9
  master.connect(ctx.destination)

  // Overall swell: rise quickly, sustain, then fade out.
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.9, now + 0.25)
  master.gain.setValueAtTime(0.9, now + duration - 0.8)
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  // One short noise burst = one clap.
  const makeClap = (at: number, gain: number, freq: number) => {
    const len = Math.floor(ctx.sampleRate * 0.04)
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) {
      // Sharp attack, fast decay so each clap reads as a crisp "tap".
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2)
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer

    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = freq
    band.Q.value = 0.8

    const g = ctx.createGain()
    g.gain.value = gain

    src.connect(band).connect(g).connect(master)
    src.start(at)
    src.stop(at + 0.05)
  }

  // Scatter many claps across the duration; density peaks early then tapers.
  const clapCount = 90
  for (let i = 0; i < clapCount; i++) {
    const progress = i / clapCount
    const jitter = Math.random() * 0.05
    const at = now + progress * (duration - 0.3) * (0.6 + Math.random() * 0.8) + jitter
    const gain = (0.12 + Math.random() * 0.18) * (1 - progress * 0.4)
    const freq = 1200 + Math.random() * 2600
    makeClap(at, gain, freq)
  }

  // Close the context once the cheer is done so we don't leak.
  window.setTimeout(() => ctx.close().catch(() => {}), durationMs + 300)
}
