import { validarCcc } from './ccc'
import { validarCodigoPostal } from './codigoPostal'
import { validarIban } from './iban'
import { validarMatricula } from './matricula'
import { validarNif } from './nif'
import { validarNss } from './nss'
import { limpiar } from './resultado'
import { validarTelefono } from './telefono'

export type Identificado =
  | { tipo: 'nif'; subtipo: string; valor: string }
  | { tipo: 'iban'; valor: string }
  | { tipo: 'ccc'; valor: string }
  | { tipo: 'nss'; valor: string }
  | { tipo: 'telefono'; subtipo: string; valor: string }
  | { tipo: 'codigo_postal'; valor: string; provincia: string }
  | { tipo: 'matricula'; valor: string }

/**
 * Averigua qué es un dato y lo devuelve validado y normalizado, o null si no
 * es nada reconocible. Pensado para buscadores y campos únicos ("pega aquí
 * tu DNI, IBAN o teléfono"). El orden evita ambigüedades: 9 cifras con letra
 * es un NIF antes que una matrícula, y 9 cifras sueltas son un teléfono.
 */
export function identificar(entrada: unknown): Identificado | null {
  const v = limpiar(entrada)
  if (!v) return null

  const nif = validarNif(v)
  if (nif.valido) return { tipo: 'nif', subtipo: nif.tipo, valor: nif.valor }

  const iban = validarIban(v)
  if (iban.valido) return { tipo: 'iban', valor: iban.valor }

  if (/^\d{20}$/.test(v)) {
    const ccc = validarCcc(v)
    if (ccc.valido) return { tipo: 'ccc', valor: ccc.valor }
  }
  if (/^\d{12}$/.test(v)) {
    const nss = validarNss(v)
    if (nss.valido) return { tipo: 'nss', valor: nss.valor }
  }
  const tel = validarTelefono(typeof entrada === 'string' || typeof entrada === 'number' ? String(entrada) : '')
  if (tel.valido) return { tipo: 'telefono', subtipo: tel.tipo, valor: tel.valor }

  const cp = validarCodigoPostal(v)
  if (cp.valido && cp.datos) return { tipo: 'codigo_postal', valor: cp.valor, provincia: cp.datos.provincia }

  const mat = validarMatricula(v)
  if (mat.valido) return { tipo: 'matricula', valor: mat.valor }

  return null
}
