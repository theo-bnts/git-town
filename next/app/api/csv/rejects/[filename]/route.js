// app/api/csv/rejects/[filename]/route.js

import { NextResponse } from 'next/server'
import fsPromises from 'fs/promises'
import fs from 'fs'
import path from 'path'

import getUser from '@/app/services/api/users/id/getUser'

async function ensureAdmin(request) {
  const token = request.cookies.get('token')?.value
  const userId = request.cookies.get('userId')?.value

  if (!token || !userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  let user
  try {
    user = await getUser(userId, token)
  } catch {
    return NextResponse.json({ error: 'Impossible de récupérer l’utilisateur' }, { status: 401 })
  }

  if (user.Role?.Keyword !== 'administrator') {
    return NextResponse.json({ error: 'Accès réservé aux admins' }, { status: 403 })
  }

  return null
}

const rejectsDir = (() => {
  const envPath = process.env.REJECTS_DIR
  if (envPath && path.isAbsolute(envPath)) return envPath
  if (envPath) return path.join(process.cwd(), envPath)
  return path.join(process.cwd(), 'rejects')
})()

export async function GET(request, { params }) {
  const forbidden = await ensureAdmin(request)
  if (forbidden) return forbidden

  const { filename } = await params
  const filePath = path.join(rejectsDir, filename)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 })
  }

  const content = '\uFEFF' + await fsPromises.readFile(filePath, 'utf8')
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

export async function DELETE(request, { params }) {
  const forbidden = await ensureAdmin(request)
  if (forbidden) return forbidden

  const { filename } = await params
  const filePath = path.join(rejectsDir, filename)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 })
  }

  await fsPromises.unlink(filePath)
  return NextResponse.json({ success: true }, { status: 200 })
}
