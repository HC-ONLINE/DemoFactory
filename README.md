# DemoFactory

Repositorio base para construir varias demos de sitios web dentro de un mismo proyecto Astro, con una estructura pensada para mantener cada demo aislada, ordenada y facil de escalar.

## Objetivo

La idea es tener un solo frontend de soporte para el sitio base y organizar cada demo como una subcarpeta independiente dentro del repo. Cada demo tendra su propio codigo, sus propios componentes y sus propios textos, sin compartir implementacion con las demas demos.

La capa comun solo debe cubrir lo necesario para el proyecto completo:

- Layout base y metadatos globales.
- Enrutamiento por idioma.
- Utilidades de contenido e i18n.
- Estilos globales minimos y tokens compartidos del sitio principal.

## Enfoque propuesto

- Una demo = una subcarpeta aislada dentro de `src/demos/`.
- Los textos de cada demo viven fuera del codigo visual, en Markdown.
- El soporte de idiomas se resuelve por ruta y por contenido, no por deteccion automatica.
- Espanol e ingles se mantienen como versiones paralelas de cada demo.
- Las rutas de cada demo se exponen como paginas distintas del sitio, no como texto plano ni como bloques sueltos.

## Estilo visual

- La base visual del proyecto usa Tailwind CSS v4.
- La tipografia global y la capa de animaciones se definen desde `src/styles/global.css`.
- Las animaciones locales existentes se conservan; esta configuracion solo centraliza la base compartida.

## Estructura de carpetas propuesta

```text
/
├── public/
│   └── assets/                    # Recursos estaticos globales si hacen falta
├── src/
│   ├── assets/                    # Imagenes o recursos usados por el sitio base
│   ├── content/
│   │   └── demos/
│   │       ├── demo-1/
│   │       │   ├── es.md          # Textos de la demo 1 en espanol
│   │       │   └── en.md          # Textos de la demo 1 en ingles
│   │       ├── demo-2/
│   │       │   ├── es.md
│   │       │   └── en.md
│   │       ├── demo-3/
│   │       │   ├── es.md
│   │       │   └── en.md
│   │       └── demo-4/
│   │           ├── es.md
│   │           └── en.md
│   ├── demos/
│   │   ├── demo-1/
│   │   │   ├── components/        # UI exclusiva de la demo 1
│   │   │   ├── data/              # Datos, mocks o helpers solo de esa demo
│   │   │   ├── types.ts           # Tipos propios de la demo 1
│   │   │   └── Demo.astro         # Entrada visual principal de la demo 1
│   │   ├── demo-2/
│   │   │   ├── components/
│   │   │   ├── data/
│   │   │   ├── types.ts
│   │   │   └── Demo.astro
│   │   ├── demo-3/
│   │   │   ├── components/
│   │   │   ├── data/
│   │   │   ├── types.ts
│   │   │   └── Demo.astro
│   │   └── demo-4/
│   │       ├── components/
│   │       ├── data/
│   │       ├── types.ts
│   │       └── Demo.astro
│   ├── layouts/
│   │   └── Layout.astro       # Layout general del sitio
│   ├── lib/
│   │   ├── i18n/                  # Helpers comunes para idioma y rutas
│   │   └── content/               # Utilidades para leer Markdown o colecciones
│   ├── pages/
│   │   ├── index.astro            # Redireccion o landing inicial
│   │   ├── es/
│   │   │   ├── index.astro        # Home en espanol
│   │   │   └── demos/
│   │   │       ├── demo-1.astro
│   │   │       ├── demo-2.astro
│   │   │       ├── demo-3.astro
│   │   │       └── demo-4.astro
│   │   └── en/
│   │       ├── index.astro        # Home en ingles
│   │       └── demos/
│   │           ├── demo-1.astro
│   │           ├── demo-2.astro
│   │           ├── demo-3.astro
│   │           └── demo-4.astro
│   └── styles/
│       └── global.css             # Estilos base y tokens minimos
├── astro.config.mjs
├── package.json
└── README.md
```

## Como funcionaria cada demo

Cada demo tendra su propia carpeta en `src/demos/<demo>/` y ahi vivira todo lo que le pertenece: componentes, helpers, tipos y cualquier logica visual o interactiva que no deba mezclarse con otras demos.

Las paginas de `src/pages/es/demos/*.astro` y `src/pages/en/demos/*.astro` solo actuaran como envoltorios de ruta. Su trabajo sera:

1. Resolver el idioma.
2. Leer el Markdown correspondiente.
3. Pasar los datos a `src/demos/<demo>/Demo.astro`.
4. Renderizar la demo dentro del layout comun.

Con ese enfoque se logra:

- Aislamiento real entre demos.
- Menor repeticion de estructura.
- i18n claro por ruta y por contenido.
- Escalabilidad para agregar mas demos sin romper las existentes.

## Convenciones para idioma

- `es` es el idioma principal visible por defecto.
- `en` es la version paralela de cada demo.
- Cada demo mantiene el mismo slug en ambos idiomas.
- Los textos no se hardcodean dentro del componente visual salvo casos tecnicos muy puntuales.

## Flujo de contenido

1. Se crea o actualiza el Markdown de la demo en `src/content/demos/<demo>/es.md` y `src/content/demos/<demo>/en.md`.
2. La pagina de ruta correspondiente carga ese contenido.
3. El componente principal de la demo recibe los datos y renderiza la UI.
4. El layout comun se encarga del marco general, SEO basico y estructura HTML.

## Estado actual del proyecto

El repo todavia conserva la base generada por Astro, asi que esta propuesta funciona como la guia de evolucion del proyecto. El siguiente paso logico es sustituir el starter por la primera demo real y luego replicar la misma convencion para las otras tres.

## Comandos

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm astro -- --help
```
