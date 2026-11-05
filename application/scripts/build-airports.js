const fs = require('fs');
const path = require('path');
const readline = require('readline');

const countryNames = {
  IN: 'India', US: 'United States', GB: 'United Kingdom', AE: 'United Arab Emirates',
  SG: 'Singapore', TH: 'Thailand', MY: 'Malaysia', CA: 'Canada', AU: 'Australia',
  DE: 'Germany', FR: 'France', NL: 'Netherlands', IT: 'Italy', ES: 'Spain',
  CH: 'Switzerland', TR: 'Turkey', SA: 'Saudi Arabia', QA: 'Qatar', OM: 'Oman',
  KW: 'Kuwait', BH: 'Bahrain', JP: 'Japan', CN: 'China', LK: 'Sri Lanka',
  NP: 'Nepal', MV: 'Maldives', ID: 'Indonesia', VN: 'Vietnam', PH: 'Philippines',
  NZ: 'New Zealand', ZA: 'South Africa', KE: 'Kenya', MU: 'Mauritius', SC: 'Seychelles',
  EG: 'Egypt', GR: 'Greece', AT: 'Austria', BE: 'Belgium', SE: 'Sweden', NO: 'Norway',
  DK: 'Denmark', FI: 'Finland', IE: 'Ireland', PT: 'Portugal', RU: 'Russia', BR: 'Brazil',
  MX: 'Mexico', AR: 'Argentina', KR: 'South Korea', HK: 'Hong Kong'
};

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

const csvPath = path.join(__dirname, '..', 'data', 'airports.csv');
const jsonPath = path.join(__dirname, '..', 'data', 'airports.json');

const rl = readline.createInterface({
  input: fs.createReadStream(csvPath),
  crlfDelay: Infinity,
});

let isHeader = true;
const airportsMap = new Map();

rl.on('line', (line) => {
  if (isHeader) {
    isHeader = false;
    return;
  }
  const cols = parseCSVLine(line);
  const type = cols[2];
  const name = cols[3];
  const isoCountry = cols[8];
  const municipality = cols[10] || '';
  const scheduled = cols[11];
  const icao = cols[12] || cols[1] || '';
  const iata = (cols[13] || '').trim().toUpperCase();

  // Filter criteria: valid 3-letter IATA code, passenger service or major/medium airport
  if (iata.length === 3 && (scheduled === 'yes' || type === 'large_airport' || type === 'medium_airport')) {
    const country = countryNames[isoCountry] || isoCountry;
    const cleanCity = municipality || name.replace(/ Airport$/i, '').trim();
    
    // De-duplicate by IATA, prefer large_airport > medium_airport > scheduled
    const existing = airportsMap.get(iata);
    if (!existing || (type === 'large_airport' && existing.type !== 'large_airport')) {
      airportsMap.set(iata, {
        iata,
        icao: (icao || '').toUpperCase(),
        name: name.trim(),
        city: cleanCity,
        country,
        countryCode: isoCountry,
        type,
      });
    }
  }
});

rl.on('close', () => {
  const airports = Array.from(airportsMap.values());
  // Sort with Indian airports first, then alphabetical by city
  airports.sort((a, b) => {
    if (a.countryCode === 'IN' && b.countryCode !== 'IN') return -1;
    if (a.countryCode !== 'IN' && b.countryCode === 'IN') return 1;
    return a.city.localeCompare(b.city);
  });

  console.log(`Extracted ${airports.length} commercial passenger airports.`);
  
  // Verify key hubs
  ['AMD', 'BOM', 'DEL', 'BLR', 'HYD', 'MAA', 'CCU', 'COK', 'TRV', 'GOI', 'DXB', 'LHR', 'SIN', 'JFK'].forEach((code) => {
    const found = airports.find((a) => a.iata === code);
    console.log(code, '->', found ? `${found.name} (${found.city}, ${found.country})` : 'MISSING');
  });

  fs.writeFileSync(jsonPath, JSON.stringify(airports));
  console.log(`Saved JSON to ${jsonPath} (Size: ${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB)`);

  // Remove the 12MB raw CSV to keep repo clean
  try {
    fs.unlinkSync(csvPath);
    console.log('Removed temporary raw CSV file.');
  } catch (e) {}
});

