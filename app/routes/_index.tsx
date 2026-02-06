import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import type { MetaFunction } from '@remix-run/node'

import { fetchWeatherData } from '../data-access/open-weather-service'
import { capitalizeFirstLetter } from '../utils/text-formatting'

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix Weather' },
    {
      name: 'description',
      content: 'A demo web app using Remix and OpenWeather API.',
    },
  ]
}

const location = {
  city: 'Ottawa',
  postalCode: 'K2G 1V8',
  lat: 45.3211,
  lon: -75.7391,
  countryCode: 'CA',
}

const units = 'metric'

export async function loader() {
  try {
    const data = await fetchWeatherData({
      lat: location.lat,
      lon: location.lon,
      units,
    })

    return json({ currentConditions: data, error: null })
  } catch (error) {
    console.error('Failed to fetch weather data:', error)

    return json({
      currentConditions: null,
      error: 'Weather service unavailable',
    })
  }
}

export default function CurrentConditions() {
  const { currentConditions, error } = useLoaderData<typeof loader>()

  if (error || !currentConditions) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
        <h1>Remix Weather</h1>
        <p>Weather data is currently unavailable.</p>
      </main>
    )
  }

  const weather = currentConditions.weather[0]

  return (
    <>
      <main
        style={{
          padding: '1.5rem',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.8',
        }}
      >
        <h1>Remix Weather</h1>
        <p>
          For Algonquin College, Woodroffe Campus <br />
          <span style={{ color: 'hsl(220, 23%, 60%)' }}>
            (LAT: {location.lat}, LON: {location.lon})
          </span>
        </p>

        <h2>Current Conditions</h2>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <img
            src={getWeatherIconUrl(weather.icon)}
            alt={weather.description}
          />
          <div style={{ fontSize: '2rem' }}>
            {currentConditions.main.temp.toFixed(1)}°C
          </div>
        </div>

        <p style={{ fontSize: '1.2rem' }}>
          {capitalizeFirstLetter(weather.description)}. Feels like{' '}
          {currentConditions.main.feels_like.toFixed(1)}°C.
        </p>
      </main>
      <section
        style={{
          backgroundColor: 'hsl(220, 54%, 96%)',
          padding: '0.5rem 1.5rem 1rem 1.5rem',
          borderRadius: '0.25rem',
        }}
      >
        <h2>Raw Data</h2>
        <pre>{JSON.stringify(currentConditions, null, 2)}</pre>
      </section>
    </>
  )
}

function getWeatherIconUrl(iconCode: string) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}
