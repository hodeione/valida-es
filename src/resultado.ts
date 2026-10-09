/** Por qué falló una validación. Útil para traducir mensajes o decidir la UX. */
export type Motivo = 'vacio' | 'formato' | 'longitud' | 'control' | 'pais' | 'rango'

export type Valido<T extends string = never> = [T] extends [never]
  ? { valido: true; valor: string }
  : { valido: true; valor: string; tipo: T }

export interface Invalido {
  valido: false
  motivo: Motivo
  /** Mensaje en castellano listo para mostrar al usuario. */
  mensaje: string
}

export type Resultado<T extends string = never> = Valido<T> | Invalido

export function invalido(motivo: Motivo, mensaje: string): Invalido {
  return { valido: false, motivo, mensaje }
}

/**
 * Normaliza lo que escribe una persona: mayúsculas y sin espacios, puntos,
 * guiones ni barras. "12.345.678-z" -> "12345678Z".
 */
export function limpiar(entrada: unknown): string {
  if (typeof entrada !== 'string' && typeof entrada !== 'number') return ''
  return String(entrada)
    .toUpperCase()
    .replace(/[\s.\-_/]/g, '')
}
