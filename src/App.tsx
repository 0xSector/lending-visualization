import { GlobeVisualization } from './components/GlobeVisualization'

function App() {
  return (
    <div className="h-screen w-screen bg-morpho-black overflow-hidden relative">
      {/* Ambient gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent-cyan/5 blur-[120px] animate-glow pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-violet/8 blur-[100px] animate-glow pointer-events-none" style={{ animationDelay: '1s' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      {/* Noise texture */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Full-screen Globe Visualization */}
      <GlobeVisualization />

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <p className="text-[10px] tracking-[0.2em] uppercase text-morpho-silver/50 font-mono">
          Morpho Blue Protocol • Live Feed
        </p>
      </div>
    </div>
  )
}

export default App
