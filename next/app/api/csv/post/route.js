// app/api/csv/post/route.js

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !file.name) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Le fichier doit être un CSV.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const importsDir = path.join(process.cwd(), 'public', 'imports');

    await fs.mkdir(importsDir, { recursive: true });

    const filePath = path.join(importsDir, file.name);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: 'Fichier CSV importé et stocké avec succès.',
      filePath,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de l\'importation du fichier.' }, { status: 500 });
  }
}
