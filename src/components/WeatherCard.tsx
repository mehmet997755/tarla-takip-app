import { useEffect, useState } from 'react';
import { WeatherData } from '../types';

interface Props {
  lat: number;
  lng: number;
}

const API_KEY = 'bd0fe159ca8c14d8b797195a4c1a0a8f';

const iconMap: Record<string, string> = {
  '01d': '☀️',
  '01n': '🌙',
  '02d': '⛅',
  '02n': '☁️',
  '03d': '☁️',
  '03n': '☁️',
  '04d': '☁️',
  '04n': '☁️',
  '09d': '🌧️',
  '09n': '🌧️',
  '10d': '🌦️',
  '10n': '🌧️',
  '11d': '⛈️',
  '11n': '⛈️',
  '13d': '❄️',
  '13n': '❄️',
  '50d': '🌫️',
  '50n': '🌫️'
};

export default function WeatherCard({ lat, lng }: Props) {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=tr`
        );
        const json = await res.json();
        if (!mounted) return;
        const weather: WeatherData = {
          temperature: Math.round(json.main.temp),
          description: json.weather?.[0]?.description,
          icon: iconMap[json.weather?.[0]?.icon] || '☁️'
        };
        setData(weather);
      } catch (error) {
        console.error('Weather fetch error', error);
      }
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [lat, lng]);

  if (!data) return <div className="text-sm text-gray-500">Hava durumu yükleniyor...</div>;

  return (
    <div className="rounded-lg bg-indigo-50 px-3 py-2 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100">
      <div className="text-2xl">{data.icon}</div>
      <div className="text-sm font-semibold">{data.temperature}°C</div>
      <div className="text-xs capitalize text-indigo-700 dark:text-indigo-200">{data.description}</div>
    </div>
  );
}
