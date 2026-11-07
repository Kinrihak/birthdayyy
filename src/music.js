// Soft procedural music box (no asset needed) or your own file via config.
export function createMusic(src) {
  let ctx, master, timer, audio, i = 0
  const seq = [0, 2, 4, 2, 1, 3, 4, 2, 0, 3, 2, 1]
  const f = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]
  const note = (fr, t) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sine'; o.frequency.value = fr
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.25, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0008, t + 1.8)
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.9)
  }
  return {
    start(v) {
      if (src) {
        if (!audio) { audio = new Audio(src); audio.loop = true }
        audio.volume = v; audio.play().catch(() => {}); return
      }
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)()
        master = ctx.createGain(); master.connect(ctx.destination)
      }
      master.gain.value = v * 0.5
      ctx.resume(); clearInterval(timer)
      timer = setInterval(() => {
        const n = seq[i++ % seq.length]
        note(f[n], ctx.currentTime)
        if (i % 4 === 1) note(f[n] / 2, ctx.currentTime)
      }, 450)
    },
    stop() { clearInterval(timer); if (audio) audio.pause() },
    volume(v) { if (audio) audio.volume = v; if (master) master.gain.value = v * 0.5 }
  }
}
