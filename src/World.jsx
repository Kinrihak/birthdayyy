import * as THREE from 'three'
import { useRef, useMemo, useEffect, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const PINK = '#FFC6DC', BABY = '#FFE3EF', LAV = '#DCD0FF', WHITE = '#FFF9FC', SKY = '#C9E7FF', GREEN = '#B9D9B2', HOT = '#FF8FB8'
const BG = [PINK, '#FFD3C4', BABY, LAV, SKY, PINK]
const GROUND = [null, GREEN, '#FFD9E8', '#E9E2FF', '#D8EFD3', BABY]
const rnd = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647
const M = ({ c, ...p }) => <meshStandardMaterial color={c} roughness={0.7} {...p} />

const heartGeo = (() => {
  const s = new THREE.Shape()
  s.moveTo(0, -0.5); s.bezierCurveTo(-0.15, -0.35, -0.55, -0.1, -0.55, 0.15)
  s.bezierCurveTo(-0.55, 0.4, -0.2, 0.5, 0, 0.25); s.bezierCurveTo(0.2, 0.5, 0.55, 0.4, 0.55, 0.15)
  s.bezierCurveTo(0.55, -0.1, 0.15, -0.35, 0, -0.5)
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.06, bevelSegments: 2 })
  g.center(); return g
})()
const starGeo = (() => {
  const s = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.22 : 0.5, a = (i * Math.PI) / 5 + Math.PI / 2
    i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }); g.center(); return g
})()

function Rig({ scene }) {
  const { camera, pointer, scene: s } = useThree()
  const tc = useRef(new THREE.Color())
  useFrame((_, d) => {
    const k = 1 - Math.exp(-d * (RM ? 8 : 1.6)), x = scene * 30
    const dx = Math.abs(x - camera.position.x)
    camera.position.x += (x + pointer.x * 1.2 - camera.position.x) * k
    camera.position.y += (2.5 + pointer.y * 0.6 - camera.position.y) * k
    camera.position.z += (9 - (RM ? 0 : Math.min(5, dx * 0.25)) - camera.position.z) * k // dolly forward while travelling
    camera.lookAt(camera.position.x - pointer.x * 1.2, 1.6, 0)
    s.background.lerp(tc.current.set(BG[scene]), k); s.fog.color.copy(s.background)
  })
  return null
}

function Floaters({ geo, n = 8, seed = 1, colors = [PINK, '#FF9EC4', LAV, WHITE], w = 14, h = 5, y = 1, z = [-4, 2], s = 0.6 }) {
  const items = useMemo(() => {
    const r = rnd(seed)
    return Array.from({ length: n }, (_, i) => ({ p: [(r() - 0.5) * w, y + r() * h, z[0] + r() * (z[1] - z[0])], s: s * (0.6 + r() * 0.8), c: colors[i % colors.length], sp: 1 + r() * 1.5 }))
  }, [])
  return items.map((o, i) => (
    <Float key={i} speed={RM ? 0 : o.sp} rotationIntensity={RM ? 0 : 0.6} floatIntensity={RM ? 0 : 1.5}>
      <mesh geometry={geo} position={o.p} scale={o.s}><M c={o.c} emissive={o.c} emissiveIntensity={0.25} /></mesh>
    </Float>
  ))
}

function Cloud({ p, s = 1, v = 0.15 }) {
  const g = useRef()
  useFrame(({ clock }) => { if (!RM) g.current.position.x = p[0] + Math.sin(clock.elapsedTime * v) * 2 })
  return (
    <group ref={g} position={p} scale={s}>
      {[[0, 0, 0, 1], [1, -0.1, 0, 0.8], [-1, -0.1, 0, 0.8], [0.4, 0.5, 0, 0.7], [-0.5, 0.4, 0.1, 0.6]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}><sphereGeometry args={[r, 20, 16]} /><M c={WHITE} emissive={WHITE} emissiveIntensity={0.3} /></mesh>
      ))}
    </group>
  )
}
const Clouds = ({ list }) => list.map((p, i) => <Cloud key={i} p={p} s={1 + (i % 3) * 0.3} v={0.1 + i * 0.03} />)

function Bow(props) {
  return (
    <group {...props}>
      {[-1, 1].map((x) => <mesh key={x} position={[x * 0.32, 0, 0]} rotation={[0, 0, (x * Math.PI) / 2]}><coneGeometry args={[0.3, 0.5, 16]} /><M c={HOT} /></mesh>)}
      <mesh><sphereGeometry args={[0.16, 16, 16]} /><M c="#FF6FA3" /></mesh>
    </group>
  )
}

// Original kawaii cat mascot (inspired by the style, not a copy of any character)
function Kitty(props) {
  return (
    <group {...props}>
      <mesh scale={[1.25, 1, 1]}><sphereGeometry args={[1, 32, 24]} /><M c={WHITE} /></mesh>
      <mesh position={[0, -1.2, 0]} scale={[0.8, 0.7, 0.7]}><sphereGeometry args={[1, 24, 16]} /><M c={HOT} /></mesh>
      {[-1, 1].map((x) => <mesh key={x} position={[x * 0.8, 0.85, 0]} rotation={[0, 0, -x * 0.3]}><coneGeometry args={[0.38, 0.6, 4]} /><M c={WHITE} /></mesh>)}
      {[-1, 1].map((x) => <mesh key={'e' + x} position={[x * 0.5, 0.08, 0.92]} scale={[0.8, 1.2, 0.5]}><sphereGeometry args={[0.09, 12, 12]} /><meshStandardMaterial color="#3a2a33" /></mesh>)}
      <mesh position={[0, -0.15, 0.98]}><sphereGeometry args={[0.1, 12, 12]} /><M c="#FFD36B" /></mesh>
      {[-1, 1].flatMap((x) => [-0.1, 0.1].map((y) => (
        <mesh key={x + '' + y} position={[x * 1.05, -0.18 + y, 0.75]} rotation={[0, 0, Math.PI / 2 + x * y * 1.2]}><cylinderGeometry args={[0.014, 0.014, 0.5]} /><meshStandardMaterial color="#8a6a78" /></mesh>
      )))}
      <Bow position={[0.7, 0.85, 0.45]} scale={0.7} rotation={[0, 0, -0.3]} />
    </group>
  )
}

function Butterfly({ seed, c }) {
  const g = useRef(), a = useRef(), b = useRef()
  useFrame(({ clock }) => {
    const t = (RM ? 0 : clock.elapsedTime) + seed * 10, f = RM ? 0.3 : Math.sin(t * 10) * 0.8
    g.current.position.set(Math.sin(t * 0.4 + seed) * 6, 1 + Math.sin(t * 0.7 + seed * 2) * 0.8 + seed, 2 + Math.cos(t * 0.3 + seed) * 2)
    g.current.rotation.y = Math.cos(t * 0.4 + seed); a.current.rotation.y = f; b.current.rotation.y = -f
  })
  const wing = (ref, x) => <group ref={ref}><mesh position={[x * 0.5, 0, 0]}><circleGeometry args={[0.5, 12]} /><meshBasicMaterial color={c} side={2} /></mesh></group>
  return <group ref={g} scale={0.35}>{wing(a, 1)}{wing(b, -1)}</group>
}

function GiftBox({ open = false, color = PINK, ribbon = HOT, onClick, ...p }) {
  const lid = useRef()
  useFrame((_, d) => {
    const k = 1 - Math.exp(-d * 5), l = lid.current
    l.position.y += ((open ? 1.6 : 1.1) - l.position.y) * k
    l.position.x += ((open ? 0.9 : 0) - l.position.x) * k
    l.rotation.z += ((open ? -0.8 : 0) - l.rotation.z) * k
  })
  const rib = (
    <>
      <mesh><boxGeometry args={[0.25, 1.02, 1.22]} /><M c={ribbon} /></mesh>
      <mesh><boxGeometry args={[1.22, 1.02, 0.25]} /><M c={ribbon} /></mesh>
    </>
  )
  return (
    <group {...p} onClick={onClick} onPointerOver={() => onClick && (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
      <mesh position={[0, 0.5, 0]}><boxGeometry args={[1.2, 1, 1.2]} /><M c={color} /></mesh>
      <group position={[0, 0.5, 0]}>{rib}</group>
      <group ref={lid} position={[0, 1.1, 0]}>
        <mesh><boxGeometry args={[1.38, 0.25, 1.38]} /><M c={color} /></mesh>
        <mesh><boxGeometry args={[0.25, 0.27, 1.4]} /><M c={ribbon} /></mesh>
        <mesh><boxGeometry args={[1.4, 0.27, 0.25]} /><M c={ribbon} /></mesh>
        <Bow position={[0, 0.3, 0]} scale={0.9} />
      </group>
    </group>
  )
}

function Cake({ wished, ...p }) {
  const fl = useRef([]), w = useRef(null), spin = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!RM) spin.current.rotation.y = t * 0.25
    if (wished && w.current === null) w.current = t
    if (!wished) w.current = null
    fl.current.forEach((m, i) => {
      if (!m) return
      let s = 1 + (RM ? 0 : Math.sin(t * 12 + i) * 0.12)
      if (w.current !== null) { const d = t - w.current; s = d < 0.7 ? 1 + d * 1.4 : Math.max(0, 1.98 - (d - 0.7) * 1.5) }
      m.scale.set(s, s * 1.6, s)
    })
  })
  return (
    <group {...p}>
      <group ref={spin}>
        <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[1.6, 1.6, 0.7, 40]} /><M c={PINK} /></mesh>
        <mesh position={[0, 1, 0]}><cylinderGeometry args={[1.2, 1.2, 0.6, 40]} /><M c={LAV} /></mesh>
        <mesh position={[0, 1.55, 0]}><cylinderGeometry args={[0.8, 0.8, 0.5, 40]} /><M c={WHITE} /></mesh>
        {[1.6, 1.2, 0.8].map((r, i) => <mesh key={i} position={[0, [0.7, 1.3, 1.8][i], 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r, 0.07, 8, 48]} /><M c="#FF9EC4" /></mesh>)}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2
          return (
            <group key={i} position={[Math.cos(a) * 0.45, 2.05, Math.sin(a) * 0.45]}>
              <mesh><cylinderGeometry args={[0.05, 0.05, 0.5, 10]} /><M c={i % 2 ? SKY : WHITE} /></mesh>
              <mesh ref={(el) => (fl.current[i] = el)} position={[0, 0.38, 0]}><sphereGeometry args={[0.09, 10, 10]} /><meshStandardMaterial color="#FFD27A" emissive="#FFA33A" emissiveIntensity={2} /></mesh>
            </group>
          )
        })}
      </group>
      <pointLight position={[0, 2.8, 0]} intensity={wished ? 0 : 4} distance={6} color="#FFC48A" />
    </group>
  )
}

function Burst({ fire }) {
  const m = useRef(), t0 = useRef(-1), N = 90
  const o = useMemo(() => new THREE.Object3D(), [])
  const d = useMemo(() => {
    const r = rnd(7), cols = [PINK, LAV, SKY, WHITE, '#FFE08A']
    return Array.from({ length: N }, () => ({ v: new THREE.Vector3((r() - 0.5) * 7, r() * 7 + 2, (r() - 0.5) * 7), p: new THREE.Vector3(), c: new THREE.Color(cols[Math.floor(r() * 5)]), r: r() * 6 }))
  }, [])
  useLayoutEffect(() => { d.forEach((x, i) => m.current.setColorAt(i, x.c)); m.current.instanceColor.needsUpdate = true }, [])
  useEffect(() => { t0.current = fire ? 0 : -1; d.forEach((x, i) => { x.p.set(0, 2.6, 0); x.v.set((i % 9 - 4) * 0.8 + x.r * 0.1, 3 + (i % 7), (i % 5 - 2) * 0.9) }) }, [fire])
  useFrame((_, dt) => {
    m.current.visible = t0.current >= 0
    if (t0.current < 0) return
    t0.current += dt
    d.forEach((x, i) => {
      x.v.y -= 6 * dt; x.p.addScaledVector(x.v, dt)
      o.position.copy(x.p); o.rotation.set(x.r * t0.current, x.r, 0); o.scale.setScalar(t0.current > 4 ? 0 : 0.14); o.updateMatrix(); m.current.setMatrixAt(i, o.matrix)
    })
    m.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={m} args={[null, null, N]} frustumCulled={false}><boxGeometry args={[1, 1, 0.2]} /><meshBasicMaterial toneMapped={false} /></instancedMesh>
}

const Sparks = (p) => !RM && <Sparkles size={4} speed={0.4} {...p} />

function Intro() {
  return (
    <>
      <Clouds list={[[-7, 3, -4], [6, 4, -6], [-3, -0.5, -8], [9, 0, -3], [0, 5.5, -10], [-10, 1, -9]]} />
      <Float speed={RM ? 0 : 1.5} floatIntensity={RM ? 0 : 1}><Kitty position={[0, 1.2, 0]} scale={1.3} /></Float>
      <Floaters geo={heartGeo} n={9} seed={3} />
      <Floaters geo={starGeo} n={7} seed={5} colors={['#FFF3B0', WHITE]} s={0.4} h={6} />
      <Float><Bow position={[-4, 2.5, 1]} scale={1.1} /></Float><Float><Bow position={[4.5, 1.2, 1]} scale={0.9} rotation={[0, 0, 0.4]} /></Float>
      <Sparks count={60} scale={[16, 8, 8]} position={[0, 2, 0]} color="#fff" />
    </>
  )
}

function Mizoram() {
  const items = useMemo(() => {
    const r = rnd(11), layers = [[-24, '#8FBF8F', 9], [-17, '#A3CFA0', 7], [-11, GREEN, 5]], hills = []
    layers.forEach(([z, c, h], li) => { for (let i = 0; i < 7; i++) hills.push({ p: [(i - 3) * 7 + (r() - 0.5) * 4, -1 + (h * (0.7 + r() * 0.6)) / 2, z], R: 4 + r() * 2.5, H: h * (0.7 + r() * 0.6), c }) })
    const houses = [], cols = [PINK, LAV, SKY, '#FFF3B0', BABY]
    for (let row = 0; row < 5; row++) {
      const h = 0.8 + row * 1.2, rad = 6.5 * (1 - h / 8), n = 5 - Math.floor(row / 2)
      for (let j = 0; j < n; j++) { const a = (j / Math.max(1, n - 1) - 0.5) * 2; houses.push({ p: [-6 + (rad + 0.15) * Math.sin(a), -1 + h + 0.25, -5 + (rad + 0.15) * Math.cos(a)], a, c: cols[(row + j) % 5] }) }
    }
    const flowers = Array.from({ length: 34 }, (_, i) => ({ p: [(r() - 0.5) * 18, -0.85, 0.5 + r() * 5], c: [PINK, WHITE, LAV, '#FFE08A'][i % 4] }))
    return { hills, houses, flowers }
  }, [])
  return (
    <>
      <mesh position={[8, 4, -34]}><sphereGeometry args={[3.2, 24, 24]} /><meshBasicMaterial color="#FFE6B0" fog={false} /></mesh>
      {items.hills.map((h, i) => <mesh key={i} position={h.p}><coneGeometry args={[h.R, h.H, 7]} /><M c={h.c} flatShading /></mesh>)}
      <mesh position={[-6, 3, -5]}><coneGeometry args={[6.5, 8, 24]} /><M c="#9FCB9A" /></mesh>
      {items.houses.map((h, i) => (
        <group key={i} position={h.p} rotation={[0, h.a, 0]}>
          <mesh><boxGeometry args={[0.55, 0.4, 0.5]} /><M c={h.c} /></mesh>
          <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.45, 0.25, 4]} /><M c={HOT} /></mesh>
        </group>
      ))}
      {items.flowers.map((f, i) => (
        <group key={i} position={f.p}>
          <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.012, 0.012, 0.22]} /><M c="#7FB87A" /></mesh>
          <mesh position={[0, 0.24, 0]}><sphereGeometry args={[0.07, 8, 8]} /><M c={f.c} /></mesh>
        </group>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => <Butterfly key={i} seed={i * 0.37 + 0.2} c={[PINK, LAV, '#FFE08A'][i % 3]} />)}
      <Clouds list={[[-8, 5, -14], [7, 6, -18], [0, 7.5, -22], [14, 4, -16]]} />
      <Floaters geo={heartGeo} n={8} seed={21} s={0.45} y={0.5} />
    </>
  )
}

function KittyCorner() {
  return (
    <>
      <Float speed={RM ? 0 : 1.2} floatIntensity={RM ? 0 : 0.6}><Kitty position={[-2.4, 1.3, 0]} scale={1.2} rotation={[0, 0.3, 0]} /></Float>
      <Cake position={[2.8, -1, 0]} scale={0.7} />
      <GiftBox position={[-5.5, -1, 1]} color={LAV} /><GiftBox position={[5.8, -1, 1.5]} color={SKY} ribbon="#fff" scale={0.8} /><GiftBox position={[0.2, -1, 2]} scale={0.7} />
      {[[-4, 2.5], [-1, 3.5], [1.2, 3], [4.5, 3.4], [6.2, 2.4]].map(([x, y], i) => (
        <Float key={i} speed={RM ? 0 : 1 + i * 0.2} floatIntensity={RM ? 0 : 1}>
          <group position={[x, y, -1]}>
            <mesh geometry={heartGeo} scale={1.1}><M c={[PINK, '#FF9EC4', LAV, WHITE, PINK][i]} emissive="#FF9EC4" emissiveIntensity={0.2} /></mesh>
            <mesh position={[0, -1.4, 0]}><cylinderGeometry args={[0.012, 0.012, 1.8]} /><meshStandardMaterial color="#fff" /></mesh>
          </group>
        </Float>
      ))}
      <Floaters geo={starGeo} n={8} seed={8} colors={['#FFF3B0', WHITE, PINK]} s={0.45} h={5} y={1.5} />
      <Float><Bow position={[-0.2, 4.6, -1]} scale={1.2} /></Float>
      <Sparks count={50} scale={[14, 6, 6]} position={[0, 2, 0]} color="#fff" />
    </>
  )
}

function Celebration({ wished }) {
  return (
    <>
      <Cake position={[0, -1, 0]} scale={1.3} wished={wished} />
      <Burst fire={wished} />
      <Sparks count={70} scale={[10, 6, 6]} position={[0, 2, 0]} color="#FFE08A" />
      {wished && <Sparkles count={140} scale={[7, 6, 7]} position={[0, 2.5, 0]} size={7} speed={2.5} color="#fff" />}
      {wished && <Floaters geo={heartGeo} n={14} seed={9} y={-0.5} h={6} w={12} s={0.45} />}
      <Floaters geo={starGeo} n={5} seed={14} colors={['#FFF3B0']} s={0.35} y={3} h={3} />
    </>
  )
}

function Letter() {
  return (
    <>
      <Float speed={RM ? 0 : 1.2} floatIntensity={RM ? 0 : 0.8}>
        <group position={[0, 1.6, 0]} rotation={[0, 0, -0.04]}>
          <mesh position={[0, 0, -0.04]}><boxGeometry args={[4.4, 3, 0.08]} /><M c={HOT} /></mesh>
          <mesh><boxGeometry args={[4, 2.6, 0.1]} /><M c={WHITE} /></mesh>
          <mesh geometry={heartGeo} position={[0, 0, 0.12]} scale={0.8}><M c="#FF6FA3" /></mesh>
        </group>
      </Float>
      <Floaters geo={heartGeo} n={10} seed={31} s={0.4} y={0} h={5} z={[-4, 0]} />
      <Sparks count={60} scale={[14, 7, 6]} position={[0, 2, 0]} color="#fff" />
    </>
  )
}

function Gift({ open, onGift }) {
  return (
    <>
      <Float speed={RM ? 0 : 1.4} floatIntensity={RM ? 0 : 0.6}><GiftBox open={open} onClick={onGift} position={[0, -0.2, 0]} scale={1.8} /></Float>
      <Sparks count={40} scale={[10, 6, 6]} position={[0, 2, 0]} color="#fff" />
      {open && <Sparkles count={160} scale={[6, 6, 6]} position={[0, 2.5, 0]} size={8} speed={2} color={PINK} />}
      {open && <Sparkles count={120} scale={[7, 7, 7]} position={[0, 2.5, 0]} size={6} speed={1.5} color="#fff" />}
      {open && <Floaters geo={heartGeo} n={14} seed={41} y={0} h={6} w={12} s={0.45} />}
    </>
  )
}

export default function World({ scene, wished, giftOpen, onGift }) {
  const scenes = [<Intro />, <Mizoram />, <KittyCorner />, <Celebration wished={wished} />, <Letter />, <Gift open={giftOpen} onGift={onGift} />]
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 2.5, 9], fov: 50 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={[BG[0]]} />
      <fog attach="fog" args={[BG[0], 18, 60]} />
      <hemisphereLight args={['#fff', '#FFC6DC', 1.1]} />
      <directionalLight position={[5, 8, 6]} intensity={1.6} color="#FFF1E6" />
      <Rig scene={scene} />
      {scenes.map((el, i) => Math.abs(i - scene) <= 1 && (
        <group key={i} position={[i * 30, 0, 0]}>
          {GROUND[i] && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}><circleGeometry args={[i === 1 ? 45 : 16, 48]} /><M c={GROUND[i]} /></mesh>}
          {el}
        </group>
      ))}
    </Canvas>
  )
}
