import { NextResponse } from 'next/server';
import airportsData from '@/data/airports.json';

export const dynamic = 'force-dynamic';

interface AirportRecord {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  type: string;
}

const airports: AirportRecord[] = airportsData as AirportRecord[];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    if (!q || q.length < 2) {
      return NextResponse.json({ airports: [] });
    }

    const scored: { airport: AirportRecord; score: number }[] = [];

    for (const a of airports) {
      const iataLower = a.iata.toLowerCase();
      const cityLower = a.city.toLowerCase();
      const nameLower = a.name.toLowerCase();
      const countryLower = a.country.toLowerCase();
      const icaoLower = a.icao.toLowerCase();

      let score = 0;

      if (iataLower === q) {
        score = 100;
      } else if (iataLower.startsWith(q)) {
        score = 90;
      } else if (cityLower.startsWith(q)) {
        score = 80;
      } else if (cityLower.includes(q)) {
        score = 70;
      } else if (nameLower.includes(q)) {
        score = 60;
      } else if (icaoLower === q || icaoLower.startsWith(q)) {
        score = 55;
      } else if (countryLower.startsWith(q) || countryLower.includes(q)) {
        score = 40;
      }

      if (score > 0) {
        // Preference for Indian domestic departure/arrivals
        if (a.countryCode === 'IN') score += 5;
        // Preference for major commercial hubs
        if (a.type === 'large_airport') score += 5;

        scored.push({ airport: a, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const topAirports = scored.slice(0, 8).map((s) => s.airport);

    return NextResponse.json({ airports: topAirports }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Airports API lookup error:', error);
    return NextResponse.json({ airports: [] }, { status: 500 });
  }
}
