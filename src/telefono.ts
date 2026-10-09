import { invalido, type Resultado } from './resultado'

export type TipoTelefono = 'movil' | 'fijo' | 'gratuito' | 'tarificacion_especial'

/**
 * Teléfonos españoles según el Plan Nacional de Numeración: 9 cifras.
 * Móviles: 6xx y 71x-74x. Fijos geográficos: 8xx y 9xx, salvo los
 * prefijos de servicios (80x y 90x). Gratuitos: 800 y 900.
 */
export function validarTelefono(entrada: unknown): Resultado<TipoTelefono> {
  if (typeof entrada !== 'string' && typeof entrada !== 'number') return invalido('vacio', 'Escribe el teléfono.')
  let v = String(entrada).replace(/[\s.\-()/]/g, '')
  if (!v) return invalido('vacio', 'Escribe el teléfono.')
  if (v.startsWith('+')) {
    if (!v.startsWith('+34')) return invalido('pais', 'Solo se validan teléfonos españoles (+34).')
    v = v.slice(3)
  } else if (v.startsWith('0034')) {
    v = v.slice(4)
  }
  if (!/^\d{9}$/.test(v)) return invalido('longitud', 'Un teléfono español tiene 9 cifras.')

  let tipo: TipoTelefono
  if (/^6/.test(v) || /^7[1-4]/.test(v)) tipo = 'movil'
  else if (/^[89]00/.test(v)) tipo = 'gratuito'
  else if (/^(80[1-9]|90[1-9])/.test(v)) tipo = 'tarificacion_especial'
  else if (/^[89][1-8]/.test(v)) tipo = 'fijo'
  else return invalido('rango', 'Ese prefijo no corresponde a un teléfono español en uso.')
  return { valido: true, valor: `+34${v}`, tipo }
}

/** "+34600112233" -> "+34 600 11 22 33" (móviles) o "+34 944 12 34 56" (fijos). */
export function formatearTelefono(telefono: unknown): string | null {
  const r = validarTelefono(telefono)
  if (!r.valido) return null
  const n = r.valor.slice(3)
  return `+34 ${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7)}`
}
