import { validarCif } from './cif'
import { validarDni, validarNie, validarNifEspecial } from './dni'
import { invalido, limpiar, type Invalido, type Resultado } from './resultado'

export type TipoNif = 'DNI' | 'NIE' | 'CIF' | 'NIF_ESPECIAL'

/**
 * Valida cualquier NIF español y dice de qué tipo es. Es lo que
 * normalmente necesita un formulario de facturación: no hace falta que la
 * persona elija antes si es DNI, NIE o CIF.
 */
export function validarNif(entrada: unknown): Resultado<TipoNif> {
  const v = limpiar(entrada)
  if (!v) return invalido('vacio', 'Escribe el NIF.')
  const primero = v[0]!
  let r: { valido: true; valor: string } | Invalido
  let tipo: TipoNif
  if (/\d/.test(primero)) {
    r = validarDni(v)
    tipo = 'DNI'
  } else if ('XYZ'.includes(primero)) {
    r = validarNie(v)
    tipo = 'NIE'
  } else if ('KLM'.includes(primero)) {
    r = validarNifEspecial(v)
    tipo = 'NIF_ESPECIAL'
  } else if ('ABCDEFGHJNPQRSUVW'.includes(primero)) {
    r = validarCif(v)
    tipo = 'CIF'
  } else {
    return invalido('formato', 'No parece un NIF: debe empezar por una cifra (DNI), X/Y/Z (NIE), K/L/M o la letra de una entidad (CIF).')
  }
  return r.valido ? { valido: true, valor: r.valor, tipo } : r
}

/** Atajo booleano. */
export const esNifValido = (entrada: unknown): boolean => validarNif(entrada).valido
