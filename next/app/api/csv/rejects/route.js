// /app/api/csv/rejects/route.js

import { NextResponse } from 'next/server';
import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

function getFormattedDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  if (!filename) {
    return NextResponse.json({ error: 'Paramètre "filename" manquant.' }, { status: 400 });
  }

  try {
    const rejectsDir = path.join(process.cwd(), 'data', 'rejects');
    const filePath = path.join(rejectsDir, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 });
    }

    let content = await fsPromises.readFile(filePath, 'utf8');
    // BOM pour Excel
    content = '\uFEFF' + content;

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la lecture du fichier CSV.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { csvContent, fileName } = await request.json() || {};
    if (!csvContent) {
      return NextResponse.json({ error: 'Aucun contenu CSV fourni.' }, { status: 400 });
    }

    const finalName = fileName || `rejects_${getFormattedDate()}.csv`;
    const rejectsDir = path.join(process.cwd(), 'data', 'rejects');

    fs.mkdirSync(rejectsDir, { recursive: true });
    const filePath = path.join(rejectsDir, finalName);

    await fsPromises.writeFile(filePath, csvContent, 'utf8');
    return NextResponse.json({ success: true, fileName: finalName }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
