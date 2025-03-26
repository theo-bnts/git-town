// /app/api/csv/get/route.js

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'assets', 'res', 'sample.csv');
    let content = await fs.readFile(filePath, 'utf8');
    content = "\uFEFF" + content;

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': 'attachment; filename="sample.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du téléchargement du CSV.' }, { status: 500 });
  }
}
