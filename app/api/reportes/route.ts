export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import RegistroProduccion from '@/models/RegistroProduccion'
import RegistroAlimento from '@/models/RegistroAlimento'
import Costo from '@/models/Costo'
import mongoose from 'mongoose'

const PRECIO_HUEVO_COP = 420

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde')
      ? new Date(searchParams.get('desde')!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const hasta = searchParams.get('hasta') ? new Date(searchParams.get('hasta')!) : new Date()
    const galponId = searchParams.get('galponId')

    await connectDB()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchBase: Record<string, any> = {
      usuarioId: new mongoose.Types.ObjectId(session.user.id),
      fecha: { $gte: desde, $lte: hasta },
    }
    if (galponId) matchBase.galponId = new mongoose.Types.ObjectId(galponId)

    // ---- PRODUCCION ----
    const produccionPorDia = await RegistroProduccion.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
          huevos: { $sum: '$cantidadHuevos' },
          mortalidad: { $sum: '$mortalidad' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const totalHuevos = produccionPorDia.reduce((s, d) => s + d.huevos, 0)
    const promedioDiario = produccionPorDia.length > 0 ? totalHuevos / produccionPorDia.length : 0
    const mejorDia = produccionPorDia.reduce(
      (best, d) => (d.huevos > best.huevos ? d : best),
      { _id: '', huevos: 0 }
    )
    const peorDia = produccionPorDia.reduce(
      (worst, d) => (d.huevos < worst.huevos ? d : worst),
      { _id: '', huevos: Infinity }
    )

    // ---- MORTALIDAD ----
    const mortalidadTotal = produccionPorDia.reduce((s, d) => s + d.mortalidad, 0)
    let mortalidadAcumulada = 0
    const mortalidadPorDia = produccionPorDia.map((d) => {
      mortalidadAcumulada += d.mortalidad
      return { fecha: d._id, mortalidad: d.mortalidad, acumulada: mortalidadAcumulada }
    })

    // ---- ALIMENTO ----
    const alimentoPorSemana = await RegistroAlimento.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id: { $isoWeek: '$fecha' },
          year: { $first: { $isoWeekYear: '$fecha' } },
          totalKg: { $sum: '$cantidadKg' },
          totalCosto: { $sum: '$costoTotal' },
        },
      },
      { $sort: { year: 1, _id: 1 } },
    ])

    const totalAlimentoKg = alimentoPorSemana.reduce((s, d) => s + d.totalKg, 0)
    const totalAlimentoCosto = alimentoPorSemana.reduce((s, d) => s + d.totalCosto, 0)
    const costoPorHuevo = totalHuevos > 0 ? totalAlimentoCosto / totalHuevos : 0

    // ---- COSTOS TOTALES ----
    const costosTotalesArr = await Costo.aggregate([
      { $match: { usuarioId: new mongoose.Types.ObjectId(session.user.id), fecha: { $gte: desde, $lte: hasta } } },
      { $group: { _id: null, total: { $sum: '$monto' } } },
    ])
    const costosTotales = costosTotalesArr[0]?.total ?? 0

    // ---- RENTABILIDAD POR MES ----
    const ingresosVsCostosPorMes = await RegistroProduccion.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$fecha' } },
          huevos: { $sum: '$cantidadHuevos' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const costosPorMes = await Costo.aggregate([
      { $match: { usuarioId: new mongoose.Types.ObjectId(session.user.id), fecha: { $gte: desde, $lte: hasta } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$fecha' } },
          total: { $sum: '$monto' },
        },
      },
    ])

    const costosPorMesMap: Record<string, number> = {}
    costosPorMes.forEach((c) => { costosPorMesMap[c._id] = c.total })

    const rentabilidadPorMes = ingresosVsCostosPorMes.map((m) => ({
      mes: m._id,
      ingresos: m.huevos * PRECIO_HUEVO_COP,
      costos: costosPorMesMap[m._id] ?? 0,
      ganancia: m.huevos * PRECIO_HUEVO_COP - (costosPorMesMap[m._id] ?? 0),
    }))

    const ingresosEstimados = totalHuevos * PRECIO_HUEVO_COP

    return NextResponse.json({
      success: true,
      data: {
        produccion: {
          total: totalHuevos,
          promedioDiario: Math.round(promedioDiario),
          mejorDia: { fecha: mejorDia._id, huevos: mejorDia.huevos },
          peorDia: {
            fecha: peorDia._id,
            huevos: peorDia.huevos === Infinity ? 0 : peorDia.huevos,
          },
          porDia: produccionPorDia.map((d) => ({ fecha: d._id, huevos: d.huevos })),
        },
        mortalidad: {
          total: mortalidadTotal,
          porcentaje: 0,
          porDia: mortalidadPorDia,
        },
        alimento: {
          totalKg: totalAlimentoKg,
          totalCosto: totalAlimentoCosto,
          costoPorHuevo,
          porSemana: alimentoPorSemana.map((s) => ({
            semana: `S${s._id}`,
            kg: s.totalKg,
            costo: s.totalCosto,
          })),
        },
        rentabilidad: {
          ingresosEstimados,
          costosTotales,
          ganancia: ingresosEstimados - costosTotales,
          porMes: rentabilidadPorMes,
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/reportes]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
