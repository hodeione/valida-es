import { invalido, limpiar, type Resultado } from './resultado'

/** Tipo de entidad según la letra inicial del CIF (Orden EHA/451/2008). */
export const ENTIDADES: Record<string, string> = {
  A: 'Sociedad anónima',
  B: 'Sociedad de responsabilidad limitada',
  C: 'Sociedad colectiva',
  D: 'Sociedad comanditaria',
  E: 'Comunidad de bienes o herencia yacente',
  F: 'Sociedad cooperativa',
  G: 'Asociación o fundación',
  H: 'Comunidad de propietarios',
  J: 'Sociedad civil',
  N: 'Entidad extranjera',
  P: 'Corporación local',
  Q: 'Organismo público',
  R: 'Congregación o institución religiosa',
  S: 'Órgano de la Administración del Estado o de las comunidades autónomas',
  U: 'Unión temporal de empresas',
  V: 'Otros tipos',
  W: 'Establecimiento permanente de entidad no residente',
}

export type LetraEntidad = keyof typeof ENTIDADES

const LETRAS_CONTROL = 'JABCDEFGHI'
/** Estas entidades llevan siempre letra de control. */
const SOLO_LETRA = new Set(['N', 'P', 'Q', 'R', 'S', 'W'])
/** Estas, siempre número. El resto admite cualquiera de los dos. */
const SOLO_NUMERO = new Set(['A', 'B', 'E', 'H'])

/**
 * Dígito de control del CIF a partir de las 7 cifras centrales:
 * se suman las cifras en posición par, y en las impares se duplica cada
 * cifra y se suman los dígitos del resultado. El control es lo que falta
 * para llegar a la siguiente decena.
 */
export function digitoControlCif(cifras: string): number {
  if (!/^\d{7}$/.test(cifras)) throw new RangeError('Se esperaban 7 cifras.')
  let suma = 0
  for (let i = 0; i < 7; i++) {
    const n = Number(cifras[i])
    if (i % 2 === 0) {
      const doble = n * 2
      suma += Math.floor(doble / 10) + (doble % 10)
    } else {
      suma += n
    }
  }
  return (10 - (suma % 10)) % 10
}

export function validarCif(entrada: unknown): Resultado<LetraEntidad> {
  const v = limpiar(entrada)
  if (!v) return invalido('vacio', 'Escribe el CIF.')
  const m = /^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/.exec(v)
  if (!m) return invalido('formato', 'El CIF es una letra de entidad, 7 cifras y un carácter de control, por ejemplo B12345674.')
  const [, letra, cifras, control] = m as unknown as [string, string, string, string]
  const digito = digitoControlCif(cifras)
  const comoLetra = LETRAS_CONTROL[digito]!
  const comoNumero = String(digito)

  let aceptados: string[]
  if (SOLO_LETRA.has(letra)) aceptados = [comoLetra]
  // Las entidades no residentes (cifras que empiezan por 00) pueden llevar letra
  // aunque su tipo sea de los que usan número: se aceptan ambos para no rechazar CIF reales.
  else if (SOLO_NUMERO.has(letra) && !cifras.startsWith('00')) aceptados = [comoNumero]
  else aceptados = [comoNumero, comoLetra]

  if (!aceptados.includes(control)) {
    return invalido('control', `El carácter de control no es correcto: debería ser ${aceptados.join(' o ')}.`)
  }
  return { valido: true, valor: letra + cifras + control, tipo: letra as LetraEntidad }
}
