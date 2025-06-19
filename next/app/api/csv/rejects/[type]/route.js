import { NextResponse } from 'next/server';
import fsPromises from 'fs/promises';
import path from 'path';
import getUser from '@/app/services/api/users/id/getUser';

async function ensureAdmin(request) {
  const token = request.cookies.get('token')?.value;
  const userId = request.cookies.get('userId')?.value;

  if (!token || !userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const user = await getUser(userId, token);
    if (user.Role?.Keyword !== 'administrator') {
      return NextResponse.json({ error: 'Accès réservé aux admins' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Erreur d’authentification' }, { status: 401 });
  }

  return null;
}

export function getRejectsDir(type) {
  const safeType = ['users', 'repositories'].includes(type) ? type : 'others';
  const envPath = process.env.REJECTS_DIR;
  const base = envPath
    ? (path.isAbsolute(envPath) ? envPath : path.join(process.cwd(), envPath))
    : path.join(process.cwd(), 'rejects');
  return path.join(base, safeType);
}

  function getFormattedDate() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());

    return `${day}-${month}-${year}_${hh}-${mm}-${ss}`;
  }

export async function GET(request, { params }) {
  const forbidden = await ensureAdmin(request);
  if (forbidden) return forbidden;

  const { type } = params;
  const dir = getRejectsDir(type);

  try {
    await fsPromises.mkdir(dir, { recursive: true });
    const files = (await fsPromises.readdir(dir))
      .filter(f => f.endsWith('.csv'))
      .sort().reverse();

    return NextResponse.json({ files }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Impossible de lister les rejets.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const forbidden = await ensureAdmin(request);
  if (forbidden) return forbidden;

  const { type } = params;
  const { csvContent } = await request.json() || {};

  if (!csvContent) {
    return NextResponse.json({ error: 'Aucun contenu CSV fourni.' }, { status: 400 });
  }

  const dir = getRejectsDir(type);
  await fsPromises.mkdir(dir, { recursive: true });

  const name = `${getFormattedDate()}.csv`;
  const filePath = path.join(dir, name);

  await fsPromises.writeFile(filePath, csvContent, 'utf8');

  return NextResponse.json({ success: true, fileName: name }, { status: 200 });
}
