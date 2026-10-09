import { describe, expect, it } from 'vitest'
import {
  aleatorioConSemilla,
  controlNss,
  digitoControlCif,
  formatearIban,
  formatearNss,
  formatearTelefono,
  generarCcc,
  generarCif,
  generarDni,
  generarIban,
  generarNie,
  generarNss,
  ibanDesdeCcc,
  letraDni,
  limpiar,
  mod97,
  provinciaDe,
  validarCcc,
  validarCif,
  validarCodigoPostal,
  validarDni,
  validarIban,
  validarMatricula,
  validarNie,
  validarNif,
  validarNifEspecial,
  validarNss,
  validarTelefono,
} from '../src'

const rnd = aleatorioConSemilla(20261009)

describe('limpiar', () => {
  it('quita separadores y pasa a mayúsculas', () => {
    expect(limpiar(' 12.345.678-z ')).toBe('12345678Z')
    expect(limpiar(null)).toBe('')
    expect(limpiar(12345678)).toBe('12345678')
  })
})

describe('DNI', () => {
  it('valida y normaliza', () => {
    expect(validarDni('12345678z')).toEqual({ valido: true, valor: '12345678Z' })
    expect(validarDni('123Z')).toMatchObject({ valido: false })
    expect(validarDni('00000000T')).toMatchObject({ valido: true })
    expect(validarDni('1-T').valido).toBe(false) // 1 -> R
    expect(validarDni('1R')).toEqual({ valido: true, valor: '00000001R' })
  })
  it('explica el motivo', () => {
    expect(validarDni('12345678A')).toMatchObject({ valido: false, motivo: 'control', mensaje: expect.stringContaining('Z') })
    expect(validarDni('ABC')).toMatchObject({ motivo: 'formato' })
    expect(validarDni('')).toMatchObject({ motivo: 'vacio' })
  })
  it('rechaza números fuera de rango al calcular la letra', () => {
    expect(() => letraDni(-1)).toThrow(RangeError)
    expect(() => letraDni(100_000_000)).toThrow(RangeError)
  })
})

describe('NIE y NIF especiales', () => {
  it('valida los tres prefijos', () => {
    expect(validarNie('X1234567L').valido).toBe(true)
    expect(validarNie('Y1234567X').valido).toBe(true)
    expect(validarNie('Z1234567R').valido).toBe(true)
    expect(validarNie('X1234567A')).toMatchObject({ motivo: 'control' })
    expect(validarNie('W1234567L')).toMatchObject({ motivo: 'formato' })
  })
  it('K, L y M', () => {
    const letra = letraDni(1234567)
    expect(validarNifEspecial(`K1234567${letra}`)).toMatchObject({ valido: true, tipo: 'K' })
    expect(validarNifEspecial('K1234567A').valido).toBe(letra === 'A')
  })
})

describe('CIF', () => {
  it('acepta CIF reales', () => {
    expect(validarCif('A28015865')).toMatchObject({ valido: true, tipo: 'A' }) // sociedad anónima
    expect(validarCif('Q2826000H')).toMatchObject({ valido: true, tipo: 'Q' }) // organismo público
    expect(validarCif('B12345674').valido).toBe(true)
  })
  it('aplica la regla de letra o número según la entidad', () => {
    expect(digitoControlCif('2826000')).toBe(8)
    expect(validarCif('Q28260008')).toMatchObject({ valido: false, motivo: 'control' }) // Q exige letra
    expect(validarCif('B1234567D')).toMatchObject({ valido: false }) // B exige número
    expect(validarCif('G12345674').valido).toBe(true) // G admite ambos
    expect(validarCif('G1234567D').valido).toBe(true)
  })
})

describe('NIF', () => {
  it('detecta el tipo automáticamente', () => {
    expect(validarNif('12345678Z')).toMatchObject({ tipo: 'DNI' })
    expect(validarNif('x-1234567-l')).toMatchObject({ tipo: 'NIE', valor: 'X1234567L' })
    expect(validarNif('A28015865')).toMatchObject({ tipo: 'CIF' })
    expect(validarNif('Ñ123')).toMatchObject({ valido: false, motivo: 'formato' })
  })
})

describe('IBAN', () => {
  it('valida IBAN españoles y extranjeros', () => {
    expect(validarIban('ES91 2100 0418 4502 0005 1332')).toMatchObject({
      valido: true,
      valor: 'ES9121000418450200051332',
      datos: { pais: 'ES', banco: { codigo: '2100', nombre: 'CaixaBank' } },
    })
    expect(validarIban('GB82 WEST 1234 5698 7654 32').valido).toBe(true)
    expect(validarIban('DE89 3704 0044 0532 0130 00').valido).toBe(true)
    expect(validarIban('IBAN ES9121000418450200051332').valido).toBe(true)
  })
  it('detecta errores de longitud, control y cuenta interna', () => {
    expect(validarIban('ES912100041845020005133')).toMatchObject({ motivo: 'longitud' })
    expect(validarIban('ES9121000418450200051333')).toMatchObject({ motivo: 'control' })
    // IBAN con control de IBAN correcto pero CCC interno incorrecto
    const malCcc = '21000418460200051332'
    const iban = `ES${String(98 - mod97(malCcc + '142800')).padStart(2, '0')}${malCcc}`
    expect(validarIban(iban)).toMatchObject({ valido: false, mensaje: expect.stringContaining('cuenta española') })
  })
  it('mod97 coincide con BigInt en números enormes', () => {
    for (let i = 0; i < 2000; i++) {
      const n = Array.from({ length: 10 + Math.floor(rnd() * 60) }, () => Math.floor(rnd() * 10)).join('')
      expect(mod97(n)).toBe(Number(BigInt(n) % 97n))
    }
  })
  it('formatea y construye desde CCC', () => {
    expect(formatearIban('es9121000418450200051332')).toBe('ES91 2100 0418 4502 0005 1332')
    expect(ibanDesdeCcc('2100 0418 45 0200051332')).toEqual({ valido: true, valor: 'ES9121000418450200051332' })
  })
})

describe('CCC', () => {
  it('comprueba los dos dígitos de control', () => {
    expect(validarCcc('2100-0418-45-0200051332').valido).toBe(true)
    expect(validarCcc('21000418550200051332')).toMatchObject({ motivo: 'control', mensaje: expect.stringContaining('45') })
  })
})

describe('Seguridad Social', () => {
  it('calcula el control con las dos reglas', () => {
    expect(controlNss('28', '12345678')).toBe(String(Number(2812345678n % 97n)).padStart(2, '0'))
    expect(controlNss('08', '01234567')).toBe(String((8 * 10_000_000 + 1234567) % 97).padStart(2, '0'))
    const nss = '2812345678' + controlNss('28', '12345678')
    expect(validarNss(formatearNss(nss))).toEqual({ valido: true, valor: nss })
    expect(validarNss('001234567890')).toMatchObject({ motivo: 'rango' })
  })
})

describe('teléfono', () => {
  it('clasifica y normaliza', () => {
    expect(validarTelefono('600 11 22 33')).toEqual({ valido: true, valor: '+34600112233', tipo: 'movil' })
    expect(validarTelefono('+34 712 345 678')).toMatchObject({ tipo: 'movil' })
    expect(validarTelefono('0034944123456')).toMatchObject({ tipo: 'fijo' })
    expect(validarTelefono('900 123 456')).toMatchObject({ tipo: 'gratuito' })
    expect(validarTelefono('902123456')).toMatchObject({ tipo: 'tarificacion_especial' })
    expect(validarTelefono('512345678')).toMatchObject({ motivo: 'rango' })
    expect(validarTelefono('+33612345678')).toMatchObject({ motivo: 'pais' })
    expect(validarTelefono('6001122')).toMatchObject({ motivo: 'longitud' })
    expect(formatearTelefono('944123456')).toBe('+34 944 12 34 56')
  })
})

describe('código postal', () => {
  it('devuelve provincia y comunidad', () => {
    expect(validarCodigoPostal('48005')).toMatchObject({ valido: true, datos: { provincia: 'Bizkaia', comunidad: 'País Vasco' } })
    expect(provinciaDe('28013')).toBe('Madrid')
    expect(validarCodigoPostal('53000')).toMatchObject({ motivo: 'rango' })
    expect(validarCodigoPostal('4800')).toMatchObject({ motivo: 'formato' })
    expect(provinciaDe('xx')).toBeNull()
  })
})

describe('matrícula', () => {
  it('formatos actual y provincial', () => {
    expect(validarMatricula('1234-bcd')).toEqual({ valido: true, valor: '1234 BCD', tipo: 'actual' })
    expect(validarMatricula('1234BCA')).toMatchObject({ valido: false })
    expect(validarMatricula('1234 BQD').valido).toBe(false)
    expect(validarMatricula('BI-1234-AZ')).toMatchObject({ valido: true, tipo: 'provincial', valor: 'BI 1234 AZ' })
    expect(validarMatricula('XX-1234-AZ').valido).toBe(false)
  })
})

describe('propiedades: generar y validar', () => {
  const casos: [string, () => string, (v: string) => { valido: boolean }][] = [
    ['DNI', () => generarDni(rnd), validarDni],
    ['NIE', () => generarNie(rnd), validarNie],
    ['CIF B', () => generarCif('B', rnd), validarCif],
    ['CIF Q', () => generarCif('Q', rnd), validarCif],
    ['CCC', () => generarCcc(rnd), validarCcc],
    ['IBAN', () => generarIban(rnd), validarIban],
    ['NSS', () => generarNss(rnd), validarNss],
  ]
  for (const [nombre, gen, val] of casos) {
    it(`1000 ${nombre} generados son válidos y cualquier cifra cambiada se detecta`, () => {
      let detectados = 0
      let mutaciones = 0
      for (let i = 0; i < 1000; i++) {
        const v = gen()
        expect(val(v).valido, v).toBe(true)
        // Cambia una cifra al azar: el control debe detectarlo.
        const pos = [...v].map((c, k) => (/\d/.test(c) ? k : -1)).filter((k) => k >= 0)
        const k = pos[Math.floor(rnd() * pos.length)]!
        const nueva = String((Number(v[k]) + 1 + Math.floor(rnd() * 9)) % 10)
        const mut = v.slice(0, k) + nueva + v.slice(k + 1)
        mutaciones++
        if (!val(mut).valido) detectados++
      }
      // DNI, NIE, IBAN y NSS detectan siempre un cambio de una cifra; CIF y CCC casi siempre.
      expect(detectados / mutaciones).toBeGreaterThan(nombre.startsWith('CIF') || nombre === 'CCC' ? 0.85 : 0.999)
    })
  }
})

import { identificar } from '../src'

describe('identificar', () => {
  it('reconoce cada tipo de dato', () => {
    expect(identificar('12345678Z')).toEqual({ tipo: 'nif', subtipo: 'DNI', valor: '12345678Z' })
    expect(identificar('A28015865')).toMatchObject({ tipo: 'nif', subtipo: 'CIF' })
    expect(identificar('ES91 2100 0418 4502 0005 1332')).toMatchObject({ tipo: 'iban' })
    expect(identificar('2100 0418 45 0200051332')).toMatchObject({ tipo: 'ccc' })
    expect(identificar('+34 600 11 22 33')).toEqual({ tipo: 'telefono', subtipo: 'movil', valor: '+34600112233' })
    expect(identificar('48005')).toEqual({ tipo: 'codigo_postal', valor: '48005', provincia: 'Bizkaia' })
    expect(identificar('1234 BCD')).toMatchObject({ tipo: 'matricula' })
    const nss = generarNss(rnd)
    expect(identificar(nss)).toMatchObject({ tipo: 'nss' })
  })
  it('devuelve null si no es nada', () => {
    expect(identificar('hola')).toBeNull()
    expect(identificar('12345678A')).toBeNull()
    expect(identificar('')).toBeNull()
  })
})
