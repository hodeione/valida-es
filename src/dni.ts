import { invalido, limpiar, type Resultado } from './resultado'

/** Tabla oficial de letras de control del DNI (Ministerio del Interior). */
export const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE'

/** Letra de control para un número de DNI (0-99999999). */
export function letraDni(numero: number): string {
  if (!Number.isInteger(numero) || numero < 0 || numero > 99_999_999) {
    throw new RangeError('El número de DNI debe ser un entero entre 0 y 99999999.')
  }
  return LETRAS_DNI[numero % 23]!
}

/**
 * DNI: 8 cifras y letra de control. Acepta números con menos cifras
 * ("123Z" -> "00000123Z"), como aparecen en documentos antiguos.
 */
export function validarDni(entrada: unknown): Resultado {
  const v = limpiar(entrada)
  if (!v) return invalido('vacio', 'Escribe el DNI.')
  const m = /^(\d{1,8})([A-Z])$/.exec(v)
  if (!m) return invalido('formato', 'El DNI tiene 8 cifras y una letra, por ejemplo 12345678Z.')
  const numero = m[1]!.padStart(8, '0')
  const esperada = letraDni(Number(numero))
  if (m[2] !== esperada) return invalido('control', `La letra no corresponde a ese número: debería ser ${esperada}.`)
  return { valido: true, valor: numero + esperada }
}

const PREFIJO_NIE: Record<string, string> = { X: '0', Y: '1', Z: '2' }

/** NIE: X, Y o Z, 7 cifras y letra. Se calcula como un DNI sustituyendo X=0, Y=1, Z=2. */
export function validarNie(entrada: unknown): Resultado {
  const v = limpiar(entrada)
  if (!v) return invalido('vacio', 'Escribe el NIE.')
  const m = /^([XYZ])(\d{7})([A-Z])$/.exec(v)
  if (!m) return invalido('formato', 'El NIE empieza por X, Y o Z, sigue con 7 cifras y acaba en letra, por ejemplo X1234567L.')
  const esperada = letraDni(Number(PREFIJO_NIE[m[1]!]! + m[2]!))
  if (m[3] !== esperada) return invalido('control', `La letra no corresponde: debería ser ${esperada}.`)
  return { valido: true, valor: m[1]! + m[2]! + esperada }
}

/**
 * NIF especiales de personas físicas:
 * K (menores de 14 sin DNI), L (residentes en el extranjero sin DNI) y
 * M (extranjeros sin NIE). Letra calculada como en el DNI sobre las 7 cifras.
 */
export function validarNifEspecial(entrada: unknown): Resultado<'K' | 'L' | 'M'> {
  const v = limpiar(entrada)
  if (!v) return invalido('vacio', 'Escribe el NIF.')
  const m = /^([KLM])(\d{7})([A-Z])$/.exec(v)
  if (!m) return invalido('formato', 'Un NIF especial empieza por K, L o M, sigue con 7 cifras y acaba en letra.')
  const esperada = letraDni(Number(m[2]))
  if (m[3] !== esperada) return invalido('control', `La letra no corresponde: debería ser ${esperada}.`)
  return { valido: true, valor: m[1]! + m[2]! + esperada, tipo: m[1] as 'K' | 'L' | 'M' }
}
