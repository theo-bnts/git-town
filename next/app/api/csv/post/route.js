// /app/api/csv/post/route.js

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier envoyé.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = 'rejects_' + Date.now() + '.csv';
    const rejectsDir = path.join(process.cwd(), 'public', 'imports', 'rejects');
    if (!fs.existsSync(rejectsDir)) {
      fs.mkdirSync(rejectsDir, { recursive: true });
    }
    const filePath = path.join(rejectsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, fileName }, { status: 200 });
  } catch (error) {
    console.error('Erreur de sauvegarde du CSV :', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
