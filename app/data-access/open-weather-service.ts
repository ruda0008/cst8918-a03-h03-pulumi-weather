import { redis } from '../data-access/redis-connection'

const API_KEY = process.env.WEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'  // Changed to 2.5
const TEN_MINUTES = 1000 * 60 * 10 // in milliseconds

interface FetchWeatherDataParams {
  lat: number
  lon: number
  units: 'standard' | 'metric' | 'imperial'
}

export async function fetchWeatherData({
  lat,
  lon,
  units
}: FetchWeatherDataParams) {
  const queryString = `lat=${lat}&lon=${lon}&units=${units}`

  const cacheEntry = await redis.get(queryString)
  if (cacheEntry) {
    console.log('Cache hit!')
    return JSON.parse(cacheEntry)
  }

  console.log('Cache miss, fetching from API...')
  const response = await fetch(`${BASE_URL}?${queryString}&appid=${API_KEY}`)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Weather API error:', response.status, errorText)
    throw new Error(`Weather API error: ${response.status}`)
  }
  
  const data = await response.text()
  console.log('API Response received, status:', response.status)
  
  await redis.set(queryString, data, {PX: TEN_MINUTES})
  return JSON.parse(data)
}