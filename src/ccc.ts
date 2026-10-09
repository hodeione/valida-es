import { invalido, limpiar, type Resultado } from './resultado'

const PESOS = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6]

/** Dígito de control de la cuenta española sobre 10 cifras (módulo 11 con pesos). */
export function digitoControlCcc(diezCifras: string): number {
  if (!/^\d{10}$/.test(diezCifras)) throw new RangeError('Se esperaban 10 cifras.')
  let suma = 0
  for (let i = 0; i < 10; i++) suma += Number(diezCifras[i]) * PESOS[i]!
  const d = 11 - (suma % 11)
  return d === 11 ? 0 : d === 10 ? 1 : d
}

/**
 * Código Cuenta Cliente (20 cifras): entidad (4) + oficina (4) + DC (2) + cuenta (10).
 * El primer DC protege entidad y oficina; el segundo, el número de cuenta.
 */
export function validarCcc(entrada: unknown): Resultado {
  const v = limpiar(entrada)
  if (!v) return invalido('vacio', 'Escribe el número de cuenta.')
  if (!/^\d{20}$/.test(v)) return invalido('formato', 'La cuenta tiene 20 cifras: entidad, oficina, control y número.')
  const dc1 = digitoControlCcc('00' + v.slice(0, 8))
  const dc2 = digitoControlCcc(v.slice(10))
  if (v.slice(8, 10) !== `${dc1}${dc2}`) return invalido('control', `Los dígitos de control no son correctos: deberían ser ${dc1}${dc2}.`)
  return { valido: true, valor: v }
}
