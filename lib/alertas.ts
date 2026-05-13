import connectDB from '@/lib/mongodb'
import Galpon from '@/models/Galpon'
import RegistroProduccion from '@/models/RegistroProduccion'
import RegistroAlimento from '@/models/RegistroAlimento'
import Alerta from '@/models/Alerta'
import { AlertaTipo, AlertaSeveridad } from '@/types'

async function crearAlertaSiNoExiste(
  usuarioId: string,
  galponId: string,
  tipo: AlertaTipo,
  severidad: AlertaSeveridad,
  titulo: string,
  mensaje: string
): Promise<void> {
  const existe = await Alerta.findOne({ usuarioId, galponId, tipo, leida: false })
  if (existe) return

  await Alerta.create({ usuarioId, galponId, tipo, severidad, titulo, mensaje })
}

export async function evaluarAlertas(galponId: string, usuarioId: string): Promise<void> {
  await connectDB()

  const galpon = await Galpon.findById(galponId)
  if (!galpon || !galpon.activo) return

  const ahora = new Date()
  const hace7Dias = new Date(ahora)
  hace7Dias.setDate(hace7Dias.getDate() - 7)

  const hace1Dia = new Date(ahora)
  hace1Dia.setDate(hace1Dia.getDate() - 1)

  // Baja producción: < 70% del promedio de los últimos 7 días
  const registros7Dias = await RegistroProduccion.find({
    galponId,
    fecha: { $gte: hace7Dias, $lt: hace1Dia },
  })

  if (registros7Dias.length > 0) {
    const totalSemana = registros7Dias.reduce((sum, r) => sum + r.cantidadHuevos, 0)
    const promedioDiario = totalSemana / 7

    const inicioDia = new Date(ahora)
    inicioDia.setHours(0, 0, 0, 0)

    const registrosHoy = await RegistroProduccion.find({
      galponId,
      fecha: { $gte: inicioDia },
    })

    const totalHoy = registrosHoy.reduce((sum, r) => sum + r.cantidadHuevos, 0)

    if (promedioDiario > 0 && totalHoy < promedioDiario * 0.7) {
      await crearAlertaSiNoExiste(
        usuarioId,
        galponId,
        'baja_produccion',
        'warning',
        'Baja producción detectada',
        `La producción de hoy (${totalHoy} huevos) está por debajo del 70% del promedio semanal (${Math.round(promedioDiario)} huevos/día) en el galpón "${galpon.nombre}".`
      )
    }
  }

  // Mortalidad alta: > 2% del galpón en 1 día
  const registrosUltimoDia = await RegistroProduccion.find({
    galponId,
    fecha: { $gte: hace1Dia },
  })

  const mortalidadTotal = registrosUltimoDia.reduce((sum, r) => sum + r.mortalidad, 0)
  const porcentajeMortalidad = galpon.cantidadGallinas > 0
    ? (mortalidadTotal / galpon.cantidadGallinas) * 100
    : 0

  if (porcentajeMortalidad > 2) {
    await crearAlertaSiNoExiste(
      usuarioId,
      galponId,
      'mortalidad_alta',
      'critical',
      'Mortalidad alta detectada',
      `Se registraron ${mortalidadTotal} gallinas muertas en las últimas 24 horas en el galpón "${galpon.nombre}" (${porcentajeMortalidad.toFixed(1)}% del total). Requiere atención inmediata.`
    )
  }

  // Alimento bajo: inventario < 3 días de consumo estimado
  const ultimoRegistroAlimento = await RegistroAlimento.findOne(
    { galponId },
    {},
    { sort: { fecha: -1 } }
  )

  if (ultimoRegistroAlimento) {
    const registrosAlimento30Dias = await RegistroAlimento.find({
      galponId,
      fecha: { $gte: new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000) },
    })

    if (registrosAlimento30Dias.length > 0) {
      const consumoTotal30Dias = registrosAlimento30Dias.reduce((sum, r) => sum + r.cantidadKg, 0)
      const consumoDiarioEstimado = consumoTotal30Dias / 30

      const diasRestantes =
        consumoDiarioEstimado > 0
          ? ultimoRegistroAlimento.inventarioRestante / consumoDiarioEstimado
          : Infinity

      if (diasRestantes < 3 && diasRestantes >= 0) {
        await crearAlertaSiNoExiste(
          usuarioId,
          galponId,
          'alimento_bajo',
          'warning',
          'Inventario de alimento bajo',
          `El inventario de alimento del galpón "${galpon.nombre}" es de ${ultimoRegistroAlimento.inventarioRestante.toFixed(1)} kg, suficiente para aproximadamente ${Math.floor(diasRestantes)} día(s).`
        )
      }
    }
  }

  // 4. Alimento agotado (inventario = 0)
  if (ultimoRegistroAlimento && ultimoRegistroAlimento.inventarioRestante <= 0) {
    await crearAlertaSiNoExiste(
      usuarioId,
      galponId,
      'alimento_bajo',
      'critical',
      'Alimento agotado',
      `El inventario de alimento del galpón "${galpon.nombre}" está en 0 kg. Es necesario reabastecer de inmediato.`
    )
  }

  // 5. Anomalía de producción: caída > 30% respecto al día anterior
  const inicioDiaHoy = new Date(ahora)
  inicioDiaHoy.setHours(0, 0, 0, 0)
  const inicioDiaAyer = new Date(inicioDiaHoy)
  inicioDiaAyer.setDate(inicioDiaAyer.getDate() - 1)

  const registrosHoyAnomalia = await RegistroProduccion.find({
    galponId,
    fecha: { $gte: inicioDiaHoy },
  })
  const registrosAyer = await RegistroProduccion.find({
    galponId,
    fecha: { $gte: inicioDiaAyer, $lt: inicioDiaHoy },
  })

  const totalHoyAnomalia = registrosHoyAnomalia.reduce((sum, r) => sum + r.cantidadHuevos, 0)
  const totalAyer = registrosAyer.reduce((sum, r) => sum + r.cantidadHuevos, 0)

  if (totalAyer > 0 && registrosHoyAnomalia.length > 0) {
    const caida = (totalAyer - totalHoyAnomalia) / totalAyer
    if (caida > 0.3) {
      await crearAlertaSiNoExiste(
        usuarioId,
        galponId,
        'anomalia',
        'critical',
        'Caída brusca de producción',
        `La producción de hoy (${totalHoyAnomalia} huevos) cayó un ${Math.round(caida * 100)}% respecto a ayer (${totalAyer} huevos) en el galpón "${galpon.nombre}". Verifique el estado del lote.`
      )
    }
  }

  // 6. Sin registro en las últimas 24h
  const registrosUltimas24h = await RegistroProduccion.find({
    galponId,
    fecha: { $gte: hace1Dia },
  })

  if (registrosUltimas24h.length === 0) {
    await crearAlertaSiNoExiste(
      usuarioId,
      galponId,
      'recordatorio',
      'info',
      'Sin registro de producción',
      `No se ha registrado producción en las últimas 24 horas para el galpón "${galpon.nombre}". Recuerda registrar la producción diaria.`
    )
  }

  // 7. Gallinas en edad pico (semanas 20-45): monitoreo especial
  if (galpon.semanasAproximadas >= 20 && galpon.semanasAproximadas <= 45) {
    await crearAlertaSiNoExiste(
      usuarioId,
      galponId,
      'recordatorio',
      'info',
      'Lote en etapa de pico de producción',
      `Monitoreo especial recomendado: Galpón "${galpon.nombre}" en etapa de pico de producción (semana ${galpon.semanasAproximadas}). Mantén un seguimiento diario detallado para maximizar el rendimiento.`
    )
  }
}
