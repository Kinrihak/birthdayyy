import { lazy, Suspense, useEffect, useRef, useState, Component } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, VolumeX } from 'lucide-react'
import * as C from './config'
import { createMusic } from './music'

const World = lazy(() => import('./World'))
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }
const Backdrop = ({ children }) => (
  <div className="absolute inset-0 flex items-center justify-center font-body text-pink-700" style={{ background: 'linear-gradient(#FFC6DC, #DCD0FF 60%, #C9E7FF)' }}>{children}</div>
)
class Boundary extends Component {
  state = { e: false }
  static getDerivedStateFromError() { return { e: true } }
  render() { return this.state.e ? <Backdrop /> : this.props.children }
}

const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 }, transition: { duration: RM ? 0 : 0.8 } }
const Btn = ({ children, ...p }) => (
  <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} className="pointer-events-auto rounded-full border border-white bg-white/80 px-8 py-3 text-lg font-semibold text-pink-700 shadow-lg shadow-pink-300/60 backdrop-blur" {...p}>{children}</motion.button>
)
const Title = ({ children }) => <h1 className="font-display text-4xl leading-tight text-white md:text-6xl [text-shadow:0_2px_18px_rgba(255,111,163,.8)]">{children}</h1>
const Sub = ({ children }) => <p className="mt-3 text-lg text-white md:text-2xl [text-shadow:0_1px_10px_rgba(255,111,163,.8)]">{children}</p>

function Typewriter({ text }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (RM) { setN(text.length); return }
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 1)), 32)
    return () => clearInterval(id)
  }, [text])
  return <span className="whitespace-pre-wrap">{text.slice(0, n)}<span className="animate-pulse">|</span></span>
}

export default function App() {
  const [scene, setScene] = useState(0)
  const [wished, setWished] = useState(false)
  const [giftOpen, setGiftOpen] = useState(false)
  const [on, setOn] = useState(false)
  const [vol, setVol] = useState(0.5)
  const music = useRef(createMusic(C.BACKGROUND_MUSIC)).current
  const gl = useRef(hasWebGL()).current

  const toggle = () => { on ? music.stop() : music.start(vol); setOn(!on) }
  const open = () => { if (!on) { music.start(vol); setOn(true) } setScene(1) }
  const replay = () => { setWished(false); setGiftOpen(false); setScene(0) }
  const next = () => setScene((s) => Math.min(5, s + 1))
  const letter = C.BIRTHDAY_MESSAGE + (C.SENDER_NAME ? `\n\n— ${C.SENDER_NAME}` : '')

  let top, mid, bottom
  if (scene === 0) { top = <><Title>A little world, just for you...</Title><Sub>Someone made something special for you.</Sub></>; bottom = <Btn onClick={open}>Open Your Surprise ♡</Btn> }
  if (scene === 1) { top = <Title>A little piece of Mizoram, just for you.</Title>; bottom = <Btn onClick={next}>Keep exploring ♡</Btn> }
  if (scene === 2) { top = <><Title>The Kitty Corner</Title><Sub>Bows, balloons and cake — all yours.</Sub></>; bottom = <Btn onClick={next}>Keep exploring ♡</Btn> }
  if (scene === 3) {
    top = <><Title>HAPPY BIRTHDAY, {C.HER_NAME.toUpperCase()}! ♡</Title>{wished && <Sub>{C.WISH_TEXT}</Sub>}</>
    bottom = wished ? <Btn onClick={next}>Read your letter ♡</Btn> : <Btn onClick={() => setWished(true)}>Make a Wish ✨</Btn>
  }
  if (scene === 4) {
    mid = <div className="pointer-events-auto max-h-[62vh] w-full max-w-xl overflow-auto rounded-3xl border border-white bg-white/75 p-6 text-left text-lg leading-relaxed text-pink-900 shadow-xl backdrop-blur md:p-8"><Typewriter text={letter} /></div>
    bottom = <Btn onClick={next}>One last thing ♡</Btn>
  }
  if (scene === 5) {
    top = giftOpen ? <Title>{C.FINAL_MESSAGE}</Title> : <><Title>A final gift</Title><Sub>Tap the gift to open it.</Sub></>
    bottom = giftOpen ? <Btn onClick={replay}>Replay This Little World</Btn> : null
  }

  return (
    <div className="relative h-full w-full overflow-hidden font-body">
      {gl ? (
        <Boundary><Suspense fallback={<Backdrop>Loading your little world ♡</Backdrop>}>
          <World scene={scene} wished={wished} giftOpen={giftOpen} onGift={() => setGiftOpen(true)} />
        </Suspense></Boundary>
      ) : <Backdrop><span className="text-6xl">🎀</span></Backdrop>}

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-between px-6 pb-16 pt-[10vh] text-center">
        <AnimatePresence mode="wait">
          <motion.div key={scene + '-' + wished + '-' + giftOpen} {...fade} className="flex h-full w-full max-w-3xl flex-col items-center justify-between">
            <div>{top}</div>
            {mid && <div className="flex w-full justify-center">{mid}</div>}
            <div className="min-h-[3rem]">{bottom}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-pink-600 backdrop-blur">
        <button onClick={toggle} aria-label={on ? 'Pause music' : 'Play music'}>{on ? <Music size={20} /> : <VolumeX size={20} />}</button>
        <input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={vol} className="w-20 accent-pink-400"
          onChange={(e) => { const v = +e.target.value; setVol(v); music.volume(v) }} />
      </div>

      <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2" role="navigation" aria-label="Progress">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <button key={i} aria-label={`Go to scene ${i + 1}`} onClick={() => setScene(i)} className={`h-2 rounded-full bg-white transition-all ${i === scene ? 'w-8' : 'w-2 opacity-60'}`} />
        ))}
      </div>
    </div>
  )
}
