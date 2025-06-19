import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import getUser from '@/app/services/api/users/id/getUser';
import { getRejectsDir } from '../../[type]/route';

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

export async function GET(request, { params }) {
  const forbidden = await ensureAdmin(request);
  if (forbidden) return forbidden;

  const { type, filename } = params;
  const filePath = path.join(getRejectsDir(type), filename);

  try {
    // On essaie directement de lire le fichier
    const raw = await fs.readFile(filePath, 'utf8');
    const content = '\uFEFF' + raw;
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 });
    }
    // autre erreur IO
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const forbidden = await ensureAdmin(request);
  if (forbidden) return forbidden;

  const { type, filename } = params;
  const filePath = path.join(getRejectsDir(type), filename);

  try {
    await fs.unlink(filePath);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
