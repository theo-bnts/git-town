import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import getUser from '@/app/services/api/users/id/getUser';

const FILES = {
  users: 'sampleImportUsers.csv',
  repositories: 'sampleImportRepositories.csv',
};

async function ensureAdmin(request) {
  const token  = request.cookies.get('token')?.value;
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
  if (forbidden) 
    return forbidden;

  const { kind } = await params;
  const fileName = FILES[kind];
  if (!fileName) {
    return NextResponse.json({ error: 'Type inconnu' }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'assets', 'res', fileName);
    let content = await fs.readFile(filePath, 'utf8');

    content = '\uFEFF' + content;

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename='${fileName}'`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur lors du téléchargement du CSV.' }, { status: 500 });
  }
}
