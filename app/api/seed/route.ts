export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import Negocio from '@/models/Negocio'
import Galpon from '@/models/Galpon'
import RegistroProduccion from '@/models/RegistroProduccion'
import RegistroAlimento from '@/models/RegistroAlimento'
import Costo from '@/models/Costo'
import Alerta from '@/models/Alerta'

// Pseudo-random determinista basada en semilla numérica
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export async function GET() {
  try {
    await connectDB()

    const hoy = new Date()
    hoy.setHours(12, 0, 0, 0)
    const diasAtras = (n: number) => {
      const d = new Date(hoy.getTime() - n * 86400000)
      d.setHours(12, 0, 0, 0)
      return d
    }

    // ─── 1. Limpiar usuario demo anterior ─────────────────────────────────────
    const usuarioExistente = await Usuario.findOne({ email: 'demo@miprone.com' })
    if (usuarioExistente) {
      const uid = usuarioExistente._id
      await RegistroProduccion.deleteMany({ usuarioId: uid })
      await RegistroAlimento.deleteMany({ usuarioId: uid })
      await Alerta.deleteMany({ usuarioId: uid })
      await Costo.deleteMany({ usuarioId: uid })
      await Galpon.deleteMany({ usuarioId: uid })
      const negocioViejo = await Negocio.findOne({ usuarioId: uid })
      if (negocioViejo) await Negocio.deleteOne({ _id: negocioViejo._id })
      await Usuario.deleteOne({ _id: uid })
    }

    // ─── 2. Crear usuario demo ─────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('demo1234', 10)
    const usuario = await Usuario.create({
      name: 'Carlos Mendoza',
      email: 'demo@miprone.com',
      password: hashedPassword,
      provider: 'credentials',
      onboardingCompleto: true,
    })
    const usuarioId = usuario._id

    // ─── 3. Crear negocio ──────────────────────────────────────────────────────
    const negocio = await Negocio.create({
      usuarioId,
      nombreFinca: 'Finca El Progreso',
      departamento: 'Santander',
      ciudad: 'Barrancabermeja',
      telefono: '3156789012',
      direccion: 'Corregimiento Meseta de San Rafael, Vía km 12',
    })
    const negocioId = negocio._id

    // Actualizar negocioId en el usuario
    await Usuario.updateOne({ _id: usuarioId }, { negocioId })

    // ─── 4. Crear galpones ─────────────────────────────────────────────────────
    const galponA = await Galpon.create({
      negocioId,
      usuarioId,
      nombre: 'Galpón A',
      cantidadGallinas: 500,
      semanasAproximadas: 32,
      raza: 'Lohmann Brown',
      activo: true,
      fechaIngreso: diasAtras(224), // 32 semanas atrás
    })

    const galponB = await Galpon.create({
      negocioId,
      usuarioId,
      nombre: 'Galpón B',
      cantidadGallinas: 800,
      semanasAproximadas: 24,
      raza: 'Hy-Line W36',
      activo: true,
      fechaIngreso: diasAtras(168), // 24 semanas atrás
    })

    const galponNorte = await Galpon.create({
      negocioId,
      usuarioId,
      nombre: 'Galpón Norte',
      cantidadGallinas: 350,
      semanasAproximadas: 47,
      raza: 'ISA Brown',
      activo: true,
      fechaIngreso: diasAtras(329), // 47 semanas atrás
    })

    // ─── 5. Registros de producción ────────────────────────────────────────────
    const registrosProduccion: object[] = []

    // Galpón A: 500 gallinas, tasa ~85-88%
    for (let dia = 35; dia >= 1; dia--) {
      const fecha = diasAtras(dia)
      const seedBase = dia * 17

      // Variación aleatoria pseudo-determinista ±5%
      let tasaMañana = 0.85 + seededRand(seedBase) * 0.03
      let tasaTarde = 0.40 + seededRand(seedBase + 3) * 0.02

      // Día 10: producción baja para trigger de alerta
      if (dia === 10) {
        tasaMañana = 0.62
        tasaTarde = 0.28
      }

      const huevosMañana = Math.round(500 * tasaMañana)
      const huevosTarde = Math.round(500 * tasaTarde)
      const rotosM = Math.round(huevosMañana * (0.01 + seededRand(seedBase + 1) * 0.02))
      const rotosT = Math.round(huevosTarde * (0.01 + seededRand(seedBase + 2) * 0.02))
      const mortalidadM = dia === 28 ? 2 : 0
      const mortalidadT = 0

      registrosProduccion.push({
        galponId: galponA._id,
        usuarioId,
        fecha,
        turno: 'mañana',
        cantidadHuevos: huevosMañana,
        huevosRotos: rotosM,
        mortalidad: mortalidadM,
        observaciones: dia === 28 ? 'Se encontraron 2 bajas por estrés térmico' : undefined,
        registradoPor: 'Carlos Mendoza',
      })
      registrosProduccion.push({
        galponId: galponA._id,
        usuarioId,
        fecha,
        turno: 'tarde',
        cantidadHuevos: huevosTarde,
        huevosRotos: rotosT,
        mortalidad: mortalidadT,
        observaciones: dia === 10 ? 'Producción baja, revisando ventilación' : undefined,
        registradoPor: 'Carlos Mendoza',
      })
    }

    // Galpón B: 800 gallinas, tasa ~75-80% (en desarrollo)
    for (let dia = 35; dia >= 1; dia--) {
      const fecha = diasAtras(dia)
      const seedBase = dia * 31 + 100

      let tasaMañana = 0.75 + seededRand(seedBase) * 0.05
      let tasaTarde = 0.38 + seededRand(seedBase + 3) * 0.04

      // Día 5: mortalidad alta (18 gallinas, alerta crítica)
      if (dia === 5) {
        tasaMañana = 0.60
        tasaTarde = 0.25
      }

      const huevosMañana = Math.round(800 * tasaMañana)
      const huevosTarde = Math.round(800 * tasaTarde)
      const rotosM = Math.round(huevosMañana * (0.01 + seededRand(seedBase + 1) * 0.02))
      const rotosT = Math.round(huevosTarde * (0.01 + seededRand(seedBase + 2) * 0.02))
      const mortalidadM = dia === 5 ? 18 : seededRand(seedBase + 5) > 0.95 ? 1 : 0
      const mortalidadT = 0

      registrosProduccion.push({
        galponId: galponB._id,
        usuarioId,
        fecha,
        turno: 'mañana',
        cantidadHuevos: huevosMañana,
        huevosRotos: rotosM,
        mortalidad: mortalidadM,
        observaciones: dia === 5 ? 'ALERTA: Mortalidad masiva detectada, posible brote Newcastle' : undefined,
        registradoPor: 'Carlos Mendoza',
      })
      registrosProduccion.push({
        galponId: galponB._id,
        usuarioId,
        fecha,
        turno: 'tarde',
        cantidadHuevos: huevosTarde,
        huevosRotos: rotosT,
        mortalidad: mortalidadT,
        registradoPor: 'Carlos Mendoza',
      })
    }

    // Galpón Norte: 350 gallinas, tasa ~65-70% (gallinas viejas)
    // NO registrar el día más reciente (día 1) para trigger de alerta "sin registro"
    for (let dia = 35; dia >= 2; dia--) {
      const fecha = diasAtras(dia)
      const seedBase = dia * 23 + 200

      const tasaMañana = 0.65 + seededRand(seedBase) * 0.05
      const tasaTarde = 0.32 + seededRand(seedBase + 3) * 0.03

      const huevosMañana = Math.round(350 * tasaMañana)
      const huevosTarde = Math.round(350 * tasaTarde)
      const rotosM = Math.round(huevosMañana * (0.015 + seededRand(seedBase + 1) * 0.015))
      const rotosT = Math.round(huevosTarde * (0.015 + seededRand(seedBase + 2) * 0.015))
      const mortalidadM = seededRand(seedBase + 6) > 0.90 ? 1 : 0

      registrosProduccion.push({
        galponId: galponNorte._id,
        usuarioId,
        fecha,
        turno: 'mañana',
        cantidadHuevos: huevosMañana,
        huevosRotos: rotosM,
        mortalidad: mortalidadM,
        registradoPor: 'Carlos Mendoza',
      })
      registrosProduccion.push({
        galponId: galponNorte._id,
        usuarioId,
        fecha,
        turno: 'tarde',
        cantidadHuevos: huevosTarde,
        huevosRotos: rotosT,
        mortalidad: 0,
        registradoPor: 'Carlos Mendoza',
      })
    }

    await RegistroProduccion.insertMany(registrosProduccion, { ordered: false })

    // ─── 6. Registros de alimento ──────────────────────────────────────────────
    // Suministros cada 3-4 días aprox (1-2 por semana), para 35 días
    const registrosAlimento: object[] = []

    // Días de suministro para cada galpón (dentro de los últimos 35 días)
    const diasSuministroA = [35, 31, 28, 24, 21, 17, 14, 10, 7, 3]
    const diasSuministroB = [35, 30, 27, 23, 20, 16, 13, 9, 6, 2]
    const diasSuministroNorte = [35, 32, 28, 24, 21, 17, 14, 10, 7, 4]

    // Consumo diario estimado: 0.12 kg/gallina/día
    const consumoA = 500 * 0.12  // 60 kg/día
    const consumoB = 800 * 0.12  // 96 kg/día
    const consumoNorte = 350 * 0.12 // 42 kg/día

    // Galpón A
    let inventarioA = 0
    for (let i = 0; i < diasSuministroA.length; i++) {
      const dia = diasSuministroA[i]
      const diaSig = i > 0 ? diasSuministroA[i - 1] : 0
      const intervalo = dia - diaSig
      const cantidadKg = Math.round(consumoA * intervalo * (1.05 + seededRand(dia * 7) * 0.1))
      const costoUnitario = Math.round(1800 + seededRand(dia * 13) * 400)
      // Consumir el inventario anterior, luego sumar
      inventarioA = Math.max(0, inventarioA - consumoA * (i === 0 ? 0 : diasSuministroA[i - 1] - dia))
      inventarioA += cantidadKg
      const tipoAlimento = seededRand(dia * 11) > 0.85 ? 'Maíz' : 'Concentrado'

      registrosAlimento.push({
        galponId: galponA._id,
        usuarioId,
        fecha: diasAtras(dia),
        tipoAlimento,
        cantidadKg,
        costoUnitario,
        costoTotal: cantidadKg * costoUnitario,
        inventarioRestante: Math.round(inventarioA),
        observaciones: tipoAlimento === 'Maíz' ? 'Suplemento energético' : undefined,
      })
    }

    // Galpón B
    let inventarioB = 0
    for (let i = 0; i < diasSuministroB.length; i++) {
      const dia = diasSuministroB[i]
      const diaSig = i > 0 ? diasSuministroB[i - 1] : 0
      const intervalo = dia - diaSig
      const cantidadKg = Math.round(consumoB * intervalo * (1.05 + seededRand(dia * 7 + 50) * 0.1))
      const costoUnitario = Math.round(1800 + seededRand(dia * 13 + 50) * 400)
      inventarioB = Math.max(0, inventarioB - consumoB * (i === 0 ? 0 : diasSuministroB[i - 1] - dia))
      inventarioB += cantidadKg
      const tipoAlimento = seededRand(dia * 11 + 50) > 0.85 ? 'Maíz' : 'Concentrado'

      registrosAlimento.push({
        galponId: galponB._id,
        usuarioId,
        fecha: diasAtras(dia),
        tipoAlimento,
        cantidadKg,
        costoUnitario,
        costoTotal: cantidadKg * costoUnitario,
        inventarioRestante: Math.round(inventarioB),
      })
    }

    // Galpón Norte: inventario muy bajo al final (< 50 kg) para alerta
    let inventarioNorte = 0
    for (let i = 0; i < diasSuministroNorte.length; i++) {
      const dia = diasSuministroNorte[i]
      const diaSig = i > 0 ? diasSuministroNorte[i - 1] : 0
      const intervalo = dia - diaSig
      // Últimos 2 suministros: cantidades más pequeñas para llegar a inventario bajo
      const factorBajo = i >= diasSuministroNorte.length - 2 ? 0.5 : 1.0
      const cantidadKg = Math.round(consumoNorte * intervalo * (1.05 + seededRand(dia * 7 + 100) * 0.1) * factorBajo)
      const costoUnitario = Math.round(1800 + seededRand(dia * 13 + 100) * 400)
      inventarioNorte = Math.max(0, inventarioNorte - consumoNorte * (i === 0 ? 0 : diasSuministroNorte[i - 1] - dia))
      inventarioNorte += cantidadKg

      // Forzar inventario bajo en el último suministro
      const inventarioFinal = i === diasSuministroNorte.length - 1
        ? Math.min(inventarioNorte, 38)
        : Math.round(inventarioNorte)

      registrosAlimento.push({
        galponId: galponNorte._id,
        usuarioId,
        fecha: diasAtras(dia),
        tipoAlimento: 'Concentrado',
        cantidadKg,
        costoUnitario,
        costoTotal: cantidadKg * costoUnitario,
        inventarioRestante: inventarioFinal,
        observaciones: i === diasSuministroNorte.length - 1 ? 'Inventario crítico, solicitar pedido urgente' : undefined,
      })
    }

    await RegistroAlimento.insertMany(registrosAlimento, { ordered: false })

    // ─── 7. Costos adicionales ─────────────────────────────────────────────────
    const costos = await Costo.insertMany([
      {
        negocioId,
        usuarioId,
        fecha: diasAtras(28),
        descripcion: 'Jornal semanal operarios',
        categoria: 'mano_obra',
        monto: 150000,
      },
      {
        negocioId,
        usuarioId,
        fecha: diasAtras(14),
        descripcion: 'Jornal semanal operarios',
        categoria: 'mano_obra',
        monto: 150000,
      },
      {
        negocioId,
        usuarioId,
        fecha: diasAtras(20),
        descripcion: 'Vitaminas y vacunas',
        categoria: 'medicamento',
        monto: 85000,
      },
      {
        negocioId,
        usuarioId,
        fecha: diasAtras(10),
        descripcion: 'Agua y electricidad',
        categoria: 'servicios',
        monto: 45000,
      },
      {
        negocioId,
        usuarioId,
        galponId: galponB._id,
        fecha: diasAtras(5),
        descripcion: 'Mantenimiento galpón B',
        categoria: 'otro',
        monto: 120000,
      },
    ])

    // ─── 8. Alertas activas ────────────────────────────────────────────────────
    await Alerta.insertMany([
      {
        usuarioId,
        galponId: galponB._id,
        tipo: 'mortalidad_alta',
        severidad: 'critical',
        titulo: 'Mortalidad alta en Galpón B',
        mensaje: 'Se registraron 18 bajas en el turno mañana del ' + diasAtras(5).toLocaleDateString('es-CO') + '. La tasa de mortalidad supera el 2% del lote. Se recomienda revisión veterinaria urgente.',
        leida: false,
      },
      {
        usuarioId,
        galponId: galponNorte._id,
        tipo: 'alimento_bajo',
        severidad: 'warning',
        titulo: 'Inventario de alimento bajo — Galpón Norte',
        mensaje: 'El inventario de alimento en Galpón Norte está en 38 kg, lo que representa menos de 1 día de consumo (consumo estimado: 42 kg/día). Realice un pedido urgente.',
        leida: false,
      },
      {
        usuarioId,
        galponId: galponNorte._id,
        tipo: 'baja_produccion',
        severidad: 'warning',
        titulo: 'Baja producción — Galpón Norte',
        mensaje: 'El Galpón Norte lleva varias semanas con producción por debajo del 70%. Con 47 semanas de postura, las aves están en fase de declive productivo. Evalúe renovación del lote.',
        leida: false,
      },
      {
        usuarioId,
        galponId: galponB._id,
        tipo: 'recordatorio',
        severidad: 'info',
        titulo: 'Galpón B en edad de monitoreo especial',
        mensaje: 'El lote del Galpón B tiene 24 semanas de postura, dentro del rango de monitoreo especial (semanas 20-45). Mantenga seguimiento semanal de peso, postura y consumo.',
        leida: false,
      },
      {
        usuarioId,
        galponId: galponNorte._id,
        tipo: 'anomalia',
        severidad: 'info',
        titulo: 'Sin registro hoy — Galpón Norte',
        mensaje: 'No se ha registrado producción en Galpón Norte para el día de hoy. Recuerde realizar el registro de los dos turnos antes de las 8 PM.',
        leida: false,
      },
    ])

    // ─── 9. Resumen ────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      mensaje: 'Datos de demo cargados correctamente',
      resumen: {
        usuario: 'demo@miprone.com / demo1234',
        galpones: 3,
        registrosProduccion: registrosProduccion.length,
        registrosAlimento: registrosAlimento.length,
        costos: costos.length,
        alertas: 5,
      },
    })
  } catch (error) {
    console.error('[SEED] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al cargar datos de demo',
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
