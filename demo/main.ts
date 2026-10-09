import {
  ENTIDADES,
  formatearIban,
  formatearTelefono,
  generarCif,
  generarDni,
  generarIban,
  generarNie,
  generarNss,
  identificar,
  validarCcc,
  validarCif,
  validarCodigoPostal,
  validarDni,
  validarIban,
  validarMatricula,
  validarNie,
  validarNif,
  validarNss,
  validarTelefono,
  type Identificado,
} from '../src'

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/* ------------------------------------------------ detector "pega cualquier dato" */

const NOMBRES: Record<Identificado['tipo'], string> = {
  nif: 'NIF',
  iban: 'IBAN',
  ccc: 'Cuenta bancaria (CCC)',
  nss: 'Nº Seguridad Social',
  telefono: 'Teléfono',
  codigo_postal: 'Código postal',
  matricula: 'Matrícula',
}

const TIPOS_TEL: Record<string, string> = { movil: 'móvil', fijo: 'fijo', gratuito: 'gratuito', tarificacion_especial: 'tarificación especial' }

function detalle(id: Identificado): string {
  switch (id.tipo) {
    case 'nif':
      return id.subtipo === 'CIF' ? `CIF · ${ENTIDADES[id.valor[0]!] ?? ''}` : id.subtipo.replace('_', ' ')
    case 'iban': {
      const r = validarIban(id.valor)
      const banco = r.valido ? r.datos?.banco : undefined
      return [formatearIban(id.valor), banco ? (banco.nombre ?? `banco ${banco.codigo}`) : ''].filter(Boolean).join(' · ')
    }
    case 'telefono':
      return `${formatearTelefono(id.valor)} · ${TIPOS_TEL[id.subtipo] ?? id.subtipo}`
    case 'codigo_postal': {
      const r = validarCodigoPostal(id.valor)
      return r.valido && r.datos ? `${r.datos.provincia} · ${r.datos.comunidad}` : ''
    }
    default:
      return ''
  }
}

/** Si no se reconoce, intenta explicar el error del validador más probable. */
function pista(v: string): string {
  const t = v.replace(/[\s.\-_/]/g, '').toUpperCase()
  if (/^[A-Z]{2}\d{2}/.test(t)) return validarIban(t).valido ? '' : (validarIban(t) as { mensaje: string }).mensaje
  if (/^[\dXYZKLMABCDEFGHJNPQRSUVW]\d{7,8}[A-Z\d]$/.test(t)) {
    const r = validarNif(t)
    return r.valido ? '' : r.mensaje
  }
  if (/^(\+34|0034)?\d+$/.test(t)) {
    const r = validarTelefono(v)
    return r.valido ? '' : r.mensaje
  }
  return 'No coincide con ningún formato español conocido.'
}

const todo = $<HTMLInputElement>('todo')
const out = $('todo-out')
function detectar() {
  const v = todo.value
  if (!v.trim()) {
    out.innerHTML = ''
    out.className = 'out'
    return
  }
  const id = identificar(v)
  if (id) {
    out.className = 'out ok'
    out.innerHTML = `<span class="badge">✓ ${NOMBRES[id.tipo]}</span><code>${esc(id.valor)}</code><span class="muted">${esc(detalle(id))}</span>`
  } else {
    out.className = 'out bad'
    out.innerHTML = `<span class="badge">✕ No válido</span><span>${esc(pista(v))}</span>`
  }
}
todo.addEventListener('input', detectar)

const EJEMPLOS = ['12345678Z', 'x-1234567-l', 'A28015865', 'ES91 2100 0418 4502 0005 1332', '+34 600 11 22 33', '28013', '1234-BCD', '12345678A']
$('ejemplos').innerHTML = EJEMPLOS.map((e) => `<button type="button" class="chip">${esc(e)}</button>`).join('')
$('ejemplos').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button')
  if (!b) return
  todo.value = b.textContent ?? ''
  detectar()
  todo.focus()
})

/* ------------------------------------------------ validador concreto */

const VALIDADORES: Record<string, { fn: (v: string) => unknown; ejemplo: string }> = {
  validarNif: { fn: validarNif, ejemplo: 'B12345674' },
  validarDni: { fn: validarDni, ejemplo: '12345678Z' },
  validarNie: { fn: validarNie, ejemplo: 'Y1234567X' },
  validarCif: { fn: validarCif, ejemplo: 'Q2826000H' },
  validarIban: { fn: validarIban, ejemplo: 'GB82 WEST 1234 5698 7654 32' },
  validarCcc: { fn: validarCcc, ejemplo: '2100 0418 45 0200051332' },
  validarNss: { fn: validarNss, ejemplo: generarNss() },
  validarTelefono: { fn: validarTelefono, ejemplo: '944 12 34 56' },
  validarCodigoPostal: { fn: validarCodigoPostal, ejemplo: '41001' },
  validarMatricula: { fn: validarMatricula, ejemplo: 'BI-1234-AZ' },
}
const sel = $<HTMLSelectElement>('fn')
const fnIn = $<HTMLInputElement>('fn-in')
sel.innerHTML = Object.keys(VALIDADORES)
  .map((k) => `<option>${k}</option>`)
  .join('')

function json(o: unknown): string {
  return esc(JSON.stringify(o, null, 2))
    .replace(/&quot;(\w+)&quot;:/g, '<span class="k">"$1"</span>:')
    .replace(/: (true)/g, ': <span class="t">$1</span>')
    .replace(/: (false)/g, ': <span class="f">$1</span>')
}
function probar() {
  const { fn } = VALIDADORES[sel.value]!
  $('fn-out').innerHTML = json(fn(fnIn.value))
  $('fn-code').innerHTML = `${sel.value}(<span class="s">'${esc(fnIn.value)}'</span>)`
}
sel.addEventListener('change', () => {
  fnIn.value = VALIDADORES[sel.value]!.ejemplo
  probar()
})
fnIn.addEventListener('input', probar)
fnIn.value = VALIDADORES[sel.value]!.ejemplo
probar()

/* ------------------------------------------------ generadores */

const GEN: [string, () => string][] = [
  ['DNI', () => generarDni()],
  ['NIE', () => generarNie()],
  ['CIF (S.L.)', () => generarCif('B')],
  ['IBAN', () => formatearIban(generarIban())],
  ['NSS', () => generarNss()],
]
function pintarGen() {
  $('gen').innerHTML = GEN.map(
    ([n, f], i) =>
      `<div class="genrow"><span class="muted">${n}</span><code id="g${i}">${esc(f())}</code><button type="button" class="copy" data-copy="g${i}">Copiar</button></div>`,
  ).join('') + '<button type="button" id="otra" class="chip">↻ Generar otros</button>'
}
pintarGen()
$('gen').addEventListener('click', (e) => {
  if ((e.target as HTMLElement).id === 'otra') pintarGen()
})

/* ------------------------------------------------ tabla de funciones */

const TABLA: [string, string][] = [
  ['validarNif · validarDni · validarNie · validarCif · validarNifEspecial', 'Letra o dígito de control, tipo de entidad del CIF y normalización.'],
  ['validarIban · ibanDesdeCcc · formatearIban', 'Módulo 97 con números de hasta 34 cifras, longitud por país y CCC interno en los españoles.'],
  ['validarCcc', 'Los dos dígitos de control de la cuenta de 20 cifras.'],
  ['validarNss · formatearNss', 'Número de afiliación a la Seguridad Social (12 cifras).'],
  ['validarTelefono · formatearTelefono', 'Móvil, fijo, gratuito o tarificación especial, en formato +34.'],
  ['validarCodigoPostal · provinciaDe', 'Provincia y comunidad autónoma.'],
  ['validarMatricula', 'Formato actual (sin vocales, Ñ ni Q) y provincial antiguo.'],
  ['identificar', 'Averigua qué tipo de dato es y lo devuelve validado.'],
  ['generarDni · generarNie · generarCif · generarIban · generarNss', 'Datos ficticios válidos para pruebas, con semilla opcional.'],
]
$('tabla').innerHTML = TABLA.map(([f, d]) => `<div><code>${f}</code><span>${d}</span></div>`).join('')

/* ------------------------------------------------ copiar */

document.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-copy]')
  if (!b) return
  const text = $(b.dataset.copy!).textContent ?? ''
  try {
    await navigator.clipboard.writeText(text)
    const prev = b.textContent
    b.textContent = '✓ Copiado'
    setTimeout(() => (b.textContent = prev), 1400)
  } catch {
    /* sin portapapeles: no pasa nada */
  }
})
