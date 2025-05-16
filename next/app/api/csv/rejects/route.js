// app/api/csv/rejects/route.js

import { NextResponse } from 'next/server';
import fsPromises from 'fs/promises';
import path from 'path';

export const config = { api: { bodyParser: false } };

function getFormattedDate() {
  return new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
}

export async function GET() {
  try {
    const rejectsDir = process.env.REJECTS_DIR;
    await fsPromises.mkdir(rejectsDir, { recursive: true });
    const files = (await fsPromises.readdir(rejectsDir))
      .filter(f => f.endsWith('.csv'))
      .sort().reverse();
    return NextResponse.json({ files }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Impossible de lister les rejets.' }, { status: 500 });
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
    await fsPromises.mkdir(rejectsDir, { recursive: true });

    const filePath = path.join(rejectsDir, finalName);
    await fsPromises.writeFile(filePath, csvContent, 'utf8');

    return NextResponse.json({ success: true, fileName: finalName }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
