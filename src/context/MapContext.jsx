import { createContext, useContext, useState } from 'react'

const MapContext = createContext(null)

export function MapProvider({ children }) {
  const [map, setMap] = useState(null)
  const [coords, setCoords] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [countryLoading, setCountryLoading] = useState(false)
  return (
    <MapContext.Provider value={{
      map,
      setMap,
      coords,
      setCoords,
      selectedCountry,
      setSelectedCountry,
      countryLoading,
      setCountryLoading,
    }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext() {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapContext must be used within MapProvider')
  return ctx
}
