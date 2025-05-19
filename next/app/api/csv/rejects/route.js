import { NextResponse } from 'next/server'
import fsPromises from 'fs/promises'
import path from 'path'

import getUser from '@/app/services/api/users/id/getUser'

async function ensureAdmin(request) {
  const token = request.cookies.get('token')?.value
  const userId = request.cookies.get('userId')?.value

  if (!token || !userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const user = await getUser(userId, token)
    if (user.Role?.Keyword !== 'administrator') {
      return NextResponse.json({ error: 'Accès réservé aux admins' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Erreur d’authentification' }, { status: 401 })
  }

  return null
}

const rejectsDir = (() => {
  const dir = process.env.REJECTS_DIR
  if (dir && path.isAbsolute(dir)) return dir
  if (dir) return path.join(process.cwd(), dir)
  return path.join(process.cwd(), 'rejects')
})()

function getFormattedDate() {
  return new Date().toISOString().replace(/[:T]/g, '-').split('.')[0]
}

export async function GET(request) {
  const forbidden = await ensureAdmin(request)
  if (forbidden) return forbidden

  try {
    await fsPromises.mkdir(rejectsDir, { recursive: true })
    const files = (await fsPromises.readdir(rejectsDir))
      .filter(f => f.endsWith('.csv'))
      .sort()
      .reverse()

    return NextResponse.json({ files }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Impossible de lister les rejets.' }, { status: 500 })
  }
}

export async function POST(request) {
  const forbidden = await ensureAdmin(request)
  if (forbidden) return forbidden

  try {
    const { csvContent } = await request.json() || {}
    if (!csvContent) {
      return NextResponse.json({ error: 'Aucun contenu CSV fourni.' }, { status: 400 })
    }

    const finalName = `rejects_${getFormattedDate()}.csv`
    await fsPromises.mkdir(rejectsDir, { recursive: true })

    const filePath = path.join(rejectsDir, finalName)
    await fsPromises.writeFile(filePath, csvContent, 'utf8')

    return NextResponse.json({ success: true, fileName: finalName }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
