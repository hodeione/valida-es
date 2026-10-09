import { invalido, limpiar, type Resultado } from './resultado'

/** Desde septiembre de 2000: 4 cifras y 3 consonantes, sin vocales ni Ñ ni Q para evitar palabras. */
const LETRAS_ACTUALES = 'BCDFGHJKLMNPRSTVWXYZ'

/** Siglas provinciales del sistema anterior (1971-2000). */
const SIGLAS = new Set([
  'A', 'AB', 'AL', 'AV', 'B', 'BA', 'BI', 'BU', 'C', 'CA', 'CC', 'CE', 'CO', 'CR', 'CS', 'CU', 'GC', 'GE', 'GI', 'GR', 'GU', 'H',
  'HU', 'IB', 'J', 'L', 'LE', 'LO', 'LU', 'M', 'MA', 'ML', 'MU', 'NA', 'O', 'OR', 'OU', 'P', 'PM', 'PO', 'S', 'SA', 'SE', 'SG',
  'SO', 'SS', 'T', 'TE', 'TF', 'TO', 'V', 'VA', 'VI', 'Z', 'ZA',
])

export type TipoMatricula = 'actual' | 'provincial'

/** Matrícula de turismo española: "1234 BCD" (actual) o "M 1234 AB" (provincial). */
export function validarMatricula(entrada: unknown): Resultado<TipoMatricula> {
  const v = limpiar(entrada)
  if (!v) return invalido('vacio', 'Escribe la matrícula.')
  const actual = /^(\d{4})([A-Z]{3})$/.exec(v)
  if (actual) {
    const letras = actual[2]!
    if ([...letras].some((c) => !LETRAS_ACTUALES.includes(c))) {
      return invalido('formato', 'Las matrículas actuales no usan vocales, Ñ ni Q.')
    }
    return { valido: true, valor: `${actual[1]} ${letras}`, tipo: 'actual' }
  }
  const prov = /^([A-Z]{1,2})(\d{4})([A-Z]{1,2})$/.exec(v)
  if (prov && SIGLAS.has(prov[1]!)) {
    return { valido: true, valor: `${prov[1]} ${prov[2]} ${prov[3]}`, tipo: 'provincial' }
  }
  return invalido('formato', 'Formato no reconocido: usa 1234 BCD o, en las antiguas, M 1234 AB.')
}
