import { invalido, limpiar, type Resultado } from './resultado'

/**
 * Dígitos de control del número de afiliación a la Seguridad Social
 * (provincia 2 + número 8). Si el número es menor de 10.000.000 se combina
 * como provincia·10⁷ + número; si no, se concatenan. El control es el resto
 * entre 97.
 */
export function controlNss(provincia: string, numero: string): string {
  if (!/^\d{2}$/.test(provincia) || !/^\d{8}$/.test(numero)) throw new RangeError('Se esperaban 2 + 8 cifras.')
  const n = Number(numero)
  const base = n < 10_000_000 ? Number(provincia) * 10_000_000 + n : Number(provincia + numero)
  return String(base % 97).padStart(2, '0')
}

/** NSS: 12 cifras (provincia + número + control). Acepta "28/12345678/40". */
export function validarNss(entrada: unknown): Resultado {
  const v = limpiar(entrada)
  if (!v) return invalido('vacio', 'Escribe el número de la Seguridad Social.')
  if (!/^\d{12}$/.test(v)) return invalido('formato', 'El número de la Seguridad Social tiene 12 cifras.')
  const provincia = v.slice(0, 2)
  if (provincia === '00') return invalido('rango', 'Las dos primeras cifras deben ser un código de provincia válido.')
  const esperado = controlNss(provincia, v.slice(2, 10))
  if (v.slice(10) !== esperado) return invalido('control', `Los dígitos de control no son correctos: deberían ser ${esperado}.`)
  return { valido: true, valor: v }
}

/** "281234567840" -> "28/12345678/40" */
export const formatearNss = (nss: string): string => limpiar(nss).replace(/^(\d{2})(\d{8})(\d{2})$/, '$1/$2/$3')
