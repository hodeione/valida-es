import { digitoControlCcc } from './ccc'
import { digitoControlCif, type LetraEntidad } from './cif'
import { letraDni } from './dni'
import { digitosControlIban } from './iban'
import { controlNss } from './nss'

/**
 * Generadores de datos de prueba VÁLIDOS pero ficticios, para rellenar
 * formularios y tests. Aceptan un generador aleatorio propio para que los
 * tests sean reproducibles.
 */
export type Aleatorio = () => number

const cifras = (n: number, rnd: Aleatorio) => Array.from({ length: n }, () => Math.floor(rnd() * 10)).join('')

export function generarDni(rnd: Aleatorio = Math.random): string {
  const n = Math.floor(rnd() * 100_000_000)
  return String(n).padStart(8, '0') + letraDni(n)
}

export function generarNie(rnd: Aleatorio = Math.random): string {
  const prefijo = 'XYZ'[Math.floor(rnd() * 3)]!
  const num = cifras(7, rnd)
  return prefijo + num + letraDni(Number(String('XYZ'.indexOf(prefijo)) + num))
}

export function generarCif(letra: LetraEntidad = 'B', rnd: Aleatorio = Math.random): string {
  // Se evita "00" al principio: es el rango de entidades no residentes.
  let num = cifras(7, rnd)
  if (num.startsWith('00')) num = '1' + num.slice(1)
  const d = digitoControlCif(num)
  const control = 'NPQRSW'.includes(letra) ? 'JABCDEFGHI'[d]! : String(d)
  return letra + num + control
}

export function generarCcc(rnd: Aleatorio = Math.random, entidad = '2100'): string {
  const oficina = cifras(4, rnd)
  const cuenta = cifras(10, rnd)
  return entidad + oficina + digitoControlCcc('00' + entidad + oficina) + digitoControlCcc(cuenta) + cuenta
}

export function generarIban(rnd: Aleatorio = Math.random, entidad = '2100'): string {
  const ccc = generarCcc(rnd, entidad)
  return 'ES' + digitosControlIban('ES', ccc) + ccc
}

export function generarNss(rnd: Aleatorio = Math.random): string {
  const provincia = String(1 + Math.floor(rnd() * 52)).padStart(2, '0')
  const numero = cifras(8, rnd)
  return provincia + numero + controlNss(provincia, numero)
}

/** Generador pseudoaleatorio con semilla (mulberry32) para tests reproducibles. */
export function aleatorioConSemilla(semilla: number): Aleatorio {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
