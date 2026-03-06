import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { fetchGdeltGeoClusters, clustersToItems } from '../api/gdeltData'

const WallMapContext = createContext(null)

export function WallMapProvider({ children }) {
  const [wallClusters, setWallClusters] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [filterSeverity, setFilterSeverity] = useState(null)
  const [filterCategory, setFilterCategory] = useState(null)

  const wallItems = useMemo(() => clustersToItems(wallClusters), [wallClusters])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const clusters = await fetchGdeltGeoClusters()
      setWallClusters(clusters)
    } catch {
      setWallClusters([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const value = {
    wallClusters,
    wallItems,
    loading,
    selectedItem,
    setSelectedItem,
    filterSeverity,
    setFilterSeverity,
    filterCategory,
    setFilterCategory,
    refresh: load,
  }

  return (
    <WallMapContext.Provider value={value}>
      {children}
    </WallMapContext.Provider>
  )
}

export function useWallMap() {
  const ctx = useContext(WallMapContext)
  if (!ctx) return {
    wallClusters: [], wallItems: [], loading: false,
    selectedItem: null, setSelectedItem: () => {},
    filterSeverity: null, setFilterSeverity: () => {},
    filterCategory: null, setFilterCategory: () => {},
    refresh: () => {},
  }
  return ctx
}
