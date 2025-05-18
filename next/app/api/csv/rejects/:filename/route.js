// app/api/csv/rejects/[filename]/route.js

import { NextResponse } from 'next/server';
import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';

export async function GET(_req, { params }) {
  const { filename } = params; 
  const filePath = path.join(process.env.REJECTS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 });
  }
  const content = '\uFEFF' + await fsPromises.readFile(filePath, 'utf8');
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    }
  });
}

export async function DELETE(_req, { params }) {
  const { filename } = params;
  const filePath = path.join(process.env.REJECTS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 });
  }
  await fsPromises.unlink(filePath);
  return NextResponse.json({ success: true }, { status: 200 });
}
