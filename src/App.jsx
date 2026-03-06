import { useState, lazy, Suspense } from 'react'
import { MapProvider } from './context/MapContext'
import { WallMapProvider } from './context/WallMapContext'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'
import Header from './components/Header'
import SidebarLeft from './components/SidebarLeft'
import SidebarRight from './components/SidebarRight'
import Footer from './components/Footer'

const WorldMap = lazy(() => import('./components/WorldMap').then(m => ({ default: m.default })))
const CoordsBox = lazy(() => import('./components/WorldMap').then(m => ({ default: m.CoordsBox })))
const WallArticleDetailWindow = lazy(() => import('./components/WallArticleDetailWindow').then(m => ({ default: m.default })))
const CountryFeedWindow = lazy(() => import('./components/CountryFeedWindow').then(m => ({ default: m.default })))
const MapLegend = lazy(() => import('./components/MapLegend').then(m => ({ default: m.default })))
const TheWall = lazy(() => import('./components/TheWall').then(m => ({ default: m.default })))

export default function App() {
  const [view, setView] = useState('map')

  return (
    <ThemeProvider>
      <SettingsProvider>
        <MapProvider>
          <div className="app">
        <Header view={view} onViewChange={setView} />
        <SidebarLeft />
        <main className="main">
          {view === 'map' ? (
            <WallMapProvider>
              <Suspense fallback={<MapLoading />}>
                <WorldMap />
                <CoordsBox />
                <WallArticleDetailWindow />
                <CountryFeedWindow />
                <MapLegend />
              </Suspense>
            </WallMapProvider>
          ) : (
            <Suspense fallback={<WallLoading />}>
              <TheWall />
            </Suspense>
          )}
        </main>
        <SidebarRight />
        <Footer />
          </div>
        </MapProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}

function MapLoading() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--ocean)',
      color: 'var(--accent)',
      fontSize: 14,
    }}>
      Loading map…
    </div>
  )
}

function WallLoading() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--ocean)',
      color: 'var(--accent)',
      fontSize: 14,
    }}>
      Loading The Wall…
    </div>
  )
}
