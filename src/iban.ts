import { validarCcc } from './ccc'
import { invalido, limpiar, type Resultado } from './resultado'

/** Longitud del IBAN por país (registro SWIFT). Zona SEPA y países habituales. */
export const LONGITUD_IBAN: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29, CH: 21, CR: 22, CY: 28, CZ: 24,
  DE: 22, DK: 18, DO: 28, EE: 20, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18, GR: 27,
  GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LI: 21, LT: 20,
  LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29,
  PT: 25, QA: 29, RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26, UA: 29, VA: 22,
  XK: 20,
}

/** Principales entidades españolas por código de banco (orientativo). */
export const BANCOS_ES: Record<string, string> = {
  '0019': 'Deutsche Bank',
  '0049': 'Banco Santander',
  '0061': 'Banca March',
  '0073': 'Openbank',
  '0081': 'Banco Sabadell',
  '0128': 'Bankinter',
  '0182': 'BBVA',
  '0186': 'Banco Mediolanum',
  '0239': 'EVO Banco',
  '1465': 'ING',
  '1491': 'Triodos Bank',
  '2080': 'Abanca',
  '2085': 'Ibercaja',
  '2095': 'Kutxabank',
  '2100': 'CaixaBank',
  '2103': 'Unicaja',
  '3035': 'Laboral Kutxa',
  '3058': 'Cajamar',
}

/**
 * Resto de dividir entre 97 un número arbitrariamente largo escrito como
 * texto. Se procesa por bloques de 7 cifras para no salir nunca del rango
 * seguro de enteros de JavaScript (2^53).
 */
export function mod97(numero: string): number {
  let resto = 0
  for (let i = 0; i < numero.length; i += 7) {
    resto = Number(String(resto) + numero.slice(i, i + 7)) % 97
  }
  return resto
}

/** Convierte letras a números según ISO 13616 (A=10 … Z=35). */
function letrasANumeros(s: string): string {
  let out = ''
  for (const c of s) out += c >= 'A' && c <= 'Z' ? String(c.charCodeAt(0) - 55) : c
  return out
}

/** Calcula los dos dígitos de control de un IBAN a partir del país y la cuenta (BBAN). */
export function digitosControlIban(pais: string, bban: string): string {
  const r = mod97(letrasANumeros(bban + pais.toUpperCase() + '00'))
  return String(98 - r).padStart(2, '0')
}

/** "ES9121000418450200051332" -> "ES91 2100 0418 4502 0005 1332" */
export function formatearIban(iban: string): string {
  return limpiar(iban).replace(/(.{4})(?=.)/g, '$1 ')
}

export interface DatosIban {
  pais: string
  /** Solo en IBAN españoles. */
  banco?: { codigo: string; nombre?: string }
}

export function validarIban(entrada: unknown): Resultado & { datos?: DatosIban } {
  const v = limpiar(entrada).replace(/^IBAN/, '')
  if (!v) return invalido('vacio', 'Escribe el IBAN.')
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(v)) {
    return invalido('formato', 'El IBAN empieza por el código del país y dos cifras, por ejemplo ES91 2100 0418 4502 0005 1332.')
  }
  const pais = v.slice(0, 2)
  const esperada = LONGITUD_IBAN[pais]
  if (esperada !== undefined && v.length !== esperada) {
    return invalido('longitud', `Un IBAN de ${pais} tiene ${esperada} caracteres y este tiene ${v.length}.`)
  }
  if (esperada === undefined && (v.length < 15 || v.length > 34)) {
    return invalido('longitud', 'Un IBAN tiene entre 15 y 34 caracteres.')
  }
  if (mod97(letrasANumeros(v.slice(4) + v.slice(0, 4))) !== 1) {
    return invalido('control', 'Los dígitos de control del IBAN no cuadran: revisa que no falte ni sobre ninguna cifra.')
  }
  const datos: DatosIban = { pais }
  if (pais === 'ES') {
    // Un IBAN español contiene la cuenta antigua (CCC), que tiene sus propios dígitos de control.
    const ccc = validarCcc(v.slice(4))
    if (!ccc.valido) return invalido('control', 'El IBAN cuadra, pero la cuenta española que contiene no es válida.')
    const codigo = v.slice(4, 8)
    const nombre = BANCOS_ES[codigo]
    datos.banco = nombre ? { codigo, nombre } : { codigo }
  }
  return { valido: true, valor: v, datos }
}

/** Construye el IBAN español a partir de una cuenta de 20 cifras (CCC). */
export function ibanDesdeCcc(ccc: unknown): Resultado {
  const r = validarCcc(ccc)
  if (!r.valido) return r
  return { valido: true, valor: `ES${digitosControlIban('ES', r.valor)}${r.valor}` }
}
