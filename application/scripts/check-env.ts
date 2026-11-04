import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('.env file not found');
  process.exit(1);
}

const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
console.log('--- ENV AUDIT (MASKED) ---');
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const rawVal = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');

  if (key.includes('URL')) {
    try {
      const u = new URL(rawVal);
      console.log(`${key}: protocol=${u.protocol}, host=${u.host}, db=${u.pathname}, sslmode=${u.searchParams.get('sslmode')}`);
    } catch {
      console.log(`${key}: [Invalid URL format]`);
    }
  } else if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD') || key.includes('TOKEN')) {
    const preview = rawVal.length > 8 ? `${rawVal.slice(0, 4)}...${rawVal.slice(-4)} (len: ${rawVal.length})` : `(len: ${rawVal.length})`;
    console.log(`${key}: ${preview}`);
  } else {
    console.log(`${key}: ${rawVal}`);
  }
}

