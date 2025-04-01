// /app/api/csv/rejects/route.js

import { NextResponse } from 'next/server';
import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

function getFormattedDate() {
  return new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  if (!filename) {
    return NextResponse.json({ error: 'Paramètre "filename" manquant.' }, { status: 400 });
  }

  try {
    const rejectsDir = process.env.REJECTS_DIR;
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
    const { csvContent } = await request.json() || {};
    if (!csvContent) {
      return NextResponse.json({ error: 'Aucun contenu CSV fourni.' }, { status: 400 });
    }

    const finalName = `rejects_${getFormattedDate()}.csv`;
    const rejectsDir = process.env.REJECTS_DIR;

    console.log("Stockage des rejets dans :", rejectsDir);

    fs.mkdirSync(rejectsDir, { recursive: true });
    const filePath = path.join(rejectsDir, finalName);

    console.log("Chemin du fichier :", filePath);

    await fsPromises.writeFile(filePath, csvContent, 'utf8');
    return NextResponse.json({ success: true, fileName: finalName }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
