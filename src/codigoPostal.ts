import { invalido, limpiar, type Resultado } from './resultado'

/** Provincias por código INE (las dos primeras cifras del código postal) y su comunidad autónoma. */
export const PROVINCIAS: Record<string, { provincia: string; comunidad: string }> = {
  '01': { provincia: 'Araba/Álava', comunidad: 'País Vasco' },
  '02': { provincia: 'Albacete', comunidad: 'Castilla-La Mancha' },
  '03': { provincia: 'Alicante/Alacant', comunidad: 'Comunitat Valenciana' },
  '04': { provincia: 'Almería', comunidad: 'Andalucía' },
  '05': { provincia: 'Ávila', comunidad: 'Castilla y León' },
  '06': { provincia: 'Badajoz', comunidad: 'Extremadura' },
  '07': { provincia: 'Illes Balears', comunidad: 'Illes Balears' },
  '08': { provincia: 'Barcelona', comunidad: 'Cataluña' },
  '09': { provincia: 'Burgos', comunidad: 'Castilla y León' },
  '10': { provincia: 'Cáceres', comunidad: 'Extremadura' },
  '11': { provincia: 'Cádiz', comunidad: 'Andalucía' },
  '12': { provincia: 'Castellón/Castelló', comunidad: 'Comunitat Valenciana' },
  '13': { provincia: 'Ciudad Real', comunidad: 'Castilla-La Mancha' },
  '14': { provincia: 'Córdoba', comunidad: 'Andalucía' },
  '15': { provincia: 'A Coruña', comunidad: 'Galicia' },
  '16': { provincia: 'Cuenca', comunidad: 'Castilla-La Mancha' },
  '17': { provincia: 'Girona', comunidad: 'Cataluña' },
  '18': { provincia: 'Granada', comunidad: 'Andalucía' },
  '19': { provincia: 'Guadalajara', comunidad: 'Castilla-La Mancha' },
  '20': { provincia: 'Gipuzkoa', comunidad: 'País Vasco' },
  '21': { provincia: 'Huelva', comunidad: 'Andalucía' },
  '22': { provincia: 'Huesca', comunidad: 'Aragón' },
  '23': { provincia: 'Jaén', comunidad: 'Andalucía' },
  '24': { provincia: 'León', comunidad: 'Castilla y León' },
  '25': { provincia: 'Lleida', comunidad: 'Cataluña' },
  '26': { provincia: 'La Rioja', comunidad: 'La Rioja' },
  '27': { provincia: 'Lugo', comunidad: 'Galicia' },
  '28': { provincia: 'Madrid', comunidad: 'Comunidad de Madrid' },
  '29': { provincia: 'Málaga', comunidad: 'Andalucía' },
  '30': { provincia: 'Murcia', comunidad: 'Región de Murcia' },
  '31': { provincia: 'Navarra', comunidad: 'Comunidad Foral de Navarra' },
  '32': { provincia: 'Ourense', comunidad: 'Galicia' },
  '33': { provincia: 'Asturias', comunidad: 'Principado de Asturias' },
  '34': { provincia: 'Palencia', comunidad: 'Castilla y León' },
  '35': { provincia: 'Las Palmas', comunidad: 'Canarias' },
  '36': { provincia: 'Pontevedra', comunidad: 'Galicia' },
  '37': { provincia: 'Salamanca', comunidad: 'Castilla y León' },
  '38': { provincia: 'Santa Cruz de Tenerife', comunidad: 'Canarias' },
  '39': { provincia: 'Cantabria', comunidad: 'Cantabria' },
  '40': { provincia: 'Segovia', comunidad: 'Castilla y León' },
  '41': { provincia: 'Sevilla', comunidad: 'Andalucía' },
  '42': { provincia: 'Soria', comunidad: 'Castilla y León' },
  '43': { provincia: 'Tarragona', comunidad: 'Cataluña' },
  '44': { provincia: 'Teruel', comunidad: 'Aragón' },
  '45': { provincia: 'Toledo', comunidad: 'Castilla-La Mancha' },
  '46': { provincia: 'Valencia/València', comunidad: 'Comunitat Valenciana' },
  '47': { provincia: 'Valladolid', comunidad: 'Castilla y León' },
  '48': { provincia: 'Bizkaia', comunidad: 'País Vasco' },
  '49': { provincia: 'Zamora', comunidad: 'Castilla y León' },
  '50': { provincia: 'Zaragoza', comunidad: 'Aragón' },
  '51': { provincia: 'Ceuta', comunidad: 'Ceuta' },
  '52': { provincia: 'Melilla', comunidad: 'Melilla' },
}

export interface DatosCodigoPostal {
  provincia: string
  comunidad: string
}

export function validarCodigoPostal(entrada: unknown): Resultado & { datos?: DatosCodigoPostal } {
  const v = limpiar(entrada)
  if (!v) return invalido('vacio', 'Escribe el código postal.')
  if (!/^\d{5}$/.test(v)) return invalido('formato', 'El código postal tiene 5 cifras.')
  const datos = PROVINCIAS[v.slice(0, 2)]
  if (!datos) return invalido('rango', 'Las dos primeras cifras deben ser una provincia (01 a 52).')
  return { valido: true, valor: v, datos }
}

/** Provincia de un código postal, o null si no es válido. */
export function provinciaDe(codigoPostal: unknown): string | null {
  const r = validarCodigoPostal(codigoPostal)
  return r.valido ? (r.datos?.provincia ?? null) : null
}
