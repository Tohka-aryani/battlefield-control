export const MARKERS = [
  { value: 6, lat: 39.5, lng: -98 },
  { value: 46, lat: 41.8, lng: -87.6 },
  { value: 28, lat: 43.6, lng: -79.4 },
  { value: 21, lat: -14.2, lng: -51.9 },
  { value: 6, lat: 4.6, lng: -74.1 },
  { value: 8, lat: -12, lng: -77 },
  { value: 3, lat: -34.6, lng: -58.4 },
  { value: 97, lat: 52.5, lng: 13.4 },
  { value: 57, lat: 51.5, lng: -0.1 },
  { value: 68, lat: 48.9, lng: 2.35 },
  { value: 17, lat: 40.4, lng: -3.7 },
  { value: 31, lat: 9.1, lng: 7.4 },
  { value: 8, lat: 30.0, lng: 31.2 },
  { value: 20, lat: -26.2, lng: 28.0 },
  { value: 62, lat: 28.6, lng: 77.2 },
  { value: 14, lat: 35.7, lng: 139.7 },
  { value: 25, lat: 39.9, lng: 116.4 },
  { value: 5, lat: -6.2, lng: 106.8 },
  { value: 4, lat: 13.7, lng: 100.5 },
  { value: 12, lat: -25.3, lng: 133.8 },
  { value: 4, lat: -36.8, lng: 174.8 },
  { value: 2, lat: -9.5, lng: 147.2 },
]

export function markerColor(value) {
  if (value < 20) return 'green'
  if (value < 60) return 'yellow'
  return 'orange'
}

export function markerRadius(value) {
  const minR = 14, maxR = 32
  const t = Math.min(100, Math.max(0, value))
  return minR + (t / 100) * (maxR - minR)
}
