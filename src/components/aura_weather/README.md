# PROJECT_KNOWLEDGE.md - Aura Weather Demo

## Visión General del Proyecto

**El Espejo del Clima** (Aura Weather) es una demostración técnica de creative coding dentro del proyecto DemoFactory, una aplicación basada en Astro que transforma datos meteorológicos en una experiencia visual inmersiva. La demo exhibe habilidades en integración de APIs, optimización de rendimiento (60fps) y sensibilidad artística a través de un mapa explorable a pantalla completa donde el clima cobra vida mediante shaders, colores y partículas.

**Stack Tecnológico:**

- **Framework:** Astro 7.0.6 (SSR/SSG híbrido)
- **Estilos:** TailwindCSS 4.3.2 con plugin de tipografía
- **Mapas:** MapLibre GL 5.24.0
- **Lenguaje:** TypeScript
- **Build:** Vite (vía Astro)

### Árbol de Directorios

```
DemoFactory/
├── src/
│   ├── components/
│   │   └── aura_weather/
│   │       ├── App.astro                    # Componente principal (718 líneas)
│   │       └── scripts/
│   │           ├── types.ts                 # Definiciones TypeScript (56 líneas)
│   │           ├── map.ts                   # Encapsulación MapLibre (222 líneas)
│   │           ├── weather.ts               # Integración APIs clima (178 líneas)
│   │           ├── particles.ts             # Sistema de partículas (294 líneas)
│   │           ├── gradients.ts             # Temas visuales y colores (100 líneas)
│   │           └── metaballs.ts             # Efecto transición metaballs (231 líneas)
│   ├── content/
│   │   └── demos/
│   │       └── aura_weather/
│   │           ├── es.md                    # Contenido español (frontmatter + markdown)
│   │           └── en.md                    # Contenido inglés (frontmatter + markdown)
│   └── pages/
│       ├── es/
│       │   └── aura_weather.astro           # Ruta español
│       └── en/
│           └── aura_weather.astro           # Ruta inglés
├── astro.config.mjs                         # Configuración Astro
├── package.json                             # Dependencias y scripts
└── PROJECT_KNOWLEDGE.md                     # Este archivo
```

---

## Configuración de Astro

El proyecto utiliza Astro en modo **estático (SSG)** por defecto. No se configura ningún adaptador de servidor, lo que significa que el build genera archivos HTML estáticos pre-renderizados.

**astro.config.mjs:**

```js
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/DemoFactory", // Ruta base para despliegue en subdirectorio
  vite: {
    plugins: [tailwindcss()], // Plugin de TailwindCSS vía Vite
  },
});
```

**Puntos clave:**

- **Modo estático (SSG):** No hay `output` ni `adapter` configurados, por lo que Astro genera HTML estático en el build
- **Ruta base:** `/DemoFactory` permite desplegar en GitHub Pages u otros servidores que sirvan desde un subdirectorio
- **TailwindCSS v4:** Se integra vía plugin de Vite (`@tailwindcss/vite`)
- **Sin SSR:** Toda la lógica de cliente (mapa, APIs, partículas) se ejecuta en el navegador via `<script>` inline en App.astro

---

## Diccionario Profundo de Archivos

### 1. App.astro

**Qué hace:**
Componente principal que actúa como punto de entrada y orquestador de toda la aplicación. Renderiza la estructura HTML completa y contiene toda la lógica de inicialización, estado global, orquestación entre módulos, y **modo de demostración** de animaciones climáticas.

**Para qué sirve:**
Define la interfaz de usuario (UI) completa de la aplicación, incluyendo mapa, barra de búsqueda con botón de demostración, paneles de información meteorológica, overlay de carga, y canvas para efectos visuales. También contiene el sistema de búsqueda de ciudades con autocompletado y el sistema de demostración que permite recorrer todos los estados climáticos sin necesidad de navegar el mapa.

**Qué contiene:**

_Estructura HTML (líneas 32-217):_

- `#aura-weather-root`: Contenedor raíz con estilos de fondo
- `#map-container`: Contenedor del mapa MapLibre (z-0)
- `#weather-gradient`: Overlay de gradiente meteorológico (z-10, pointer-events-none)
- `#weather-particles`: Canvas para sistema de partículas (z-20)
- `#metaball-canvas`: Canvas para efectos de metaballs (z-25, oculto por defecto)
- `#transition-indicator`: Indicador de transición entre estados (z-40)
- `#weather-ui`: Contenedor de toda la interfaz de usuario (z-30)
  - `#search-container`: Barra de búsqueda con input, botón de ubicación, y botón de demostración
  - `#weather-info`: Panel de información principal (ciudad, temperatura, descripción)
  - `#weather-details`: Panel de detalles (viento, humedad, sensación térmica)
  - `#loading-overlay`: Overlay de carga inicial

_Script principal (líneas 219-833):_

- **Constantes de IDs** (líneas 220-241): Referencias a todos los elementos DOM
- **Estado global** (líneas 252-264): Objeto `state` que mantiene:
  - `currentWeather`: Datos meteorológicos actuales
  - `currentLocation`: Ubicación actual
  - `mapInstance`: Instancia del mapa MapLibre
  - `particleSystem`: Sistema de partículas
  - `metaballTransition`: Efecto de transición metaballs
  - `currentTheme` / `targetTheme`: Temas visuales
  - `previousWeatherState`: Estado anterior para detectar cambios
- **Funciones de UI** (líneas 266-359):
  - `showTransition(text)`: Muestra indicador de transición
  - `hideTransition()`: Oculta indicador de transición
  - `showLoading()` / `hideLoading()`: Control del overlay de carga
  - `updateWeatherInfo(weather, location)`: Actualiza panel de información
  - `updateGradient(theme)`: Aplica gradiente radial al overlay
  - `selectCity(index)`: Selecciona ciudad del dropdown de búsqueda
- **Sistema de búsqueda** (líneas 361-487):
  - `initSearch()`: Configura event listeners para input, dropdown, y botón de ubicación
  - Búsqueda con debounce de 300ms
  - Dropdown con resultados seleccionables
  - Soporte para teclado (Enter, Escape)
- **Sistema de demostración** (líneas 635-823):
  - `DEMO_STATES`: Array con los 6 estados climáticos y datos fake para cada uno
  - `demoDescriptions`: Descripciones localizadas para cada estado
  - `runDemo()`: Función principal del ciclo de demostración
  - Botón `#demo-btn` con ícono de play en la barra de búsqueda
- **Función de inicialización** (líneas 489-833):
  - `init()`: Función principal que orquesta todo el arranque
  - Importa dinámicamente todos los módulos
  - Configura el mapa con ubicación inicial (Bogotá por defecto)
  - Instancia sistema de partículas y metaballs
  - Configura callback `onMoveEnd` para actualizar clima al mover mapa
  - Configura callback `onDrag` para inercia de partículas
  - Maneja resize de ventana
  - Configura event listener del botón de demostración

**Cómo se usa:**

- Se importa en las páginas `es/aura_weather.astro` y `en/aura_weather.astro`
- Recibe props `content` (metadata del frontmatter, incluyendo `demoButton`) y `lang` (idioma)
- Los módulos se importan dinámicamente usando `await import('./scripts/...')`
- La función `init()` se ejecuta automáticamente al cargar el script
- El botón de demostración se renderiza dentro de la barra de búsqueda junto al botón de ubicación

---

### 2. map.ts (222 líneas)

**Qué hace:**
Módulo de encapsulación de MapLibre GL que proporciona una API simplificada para interactuar con el mapa. Maneja inicialización, eventos de movimiento, drag con velocity tracking, y geolocalización del usuario.

**Para qué sirve:**
Abstrae la complejidad de MapLibre GL proporcionando una interfaz limpia (`MapInstance`) que el componente principal puede usar sin preocuparse por los detalles de implementación del mapa.

**Qué contiene:**

_Constantes:_

- `MAP_STYLE`: URL del estilo de mapa `'https://tiles.openfreemap.org/styles/liberty'` (estilo gratuito sin API key)

_Interfaces:_

- `DragVelocity`: `{ vx: number, vy: number }` - Velocidad del arrastre
- `MapInstance`: Interfaz pública del módulo con métodos:
  - `map`: Instancia raw de maplibregl.Map
  - `destroy()`: Limpia el mapa
  - `onMove(callback)`: Registra callback para movimiento continuo
  - `onMoveEnd(callback)`: Registra callback para fin de movimiento
  - `onDrag(callback)`: Registra callback para arrastre con velocity
  - `flyTo(location, zoom?)`: Anima vuelo a una ubicación
  - `getCamera()`: Retorna estado actual de la cámara

_Funciones:_

- `initMap(container, initialCenter, initialZoom)`: Crea instancia del mapa con:
  - Estilo OpenFreeMap (gratuito, sin API key)
  - Control de navegación (sin brújula)
  - Tracking de drag con cálculo de velocity (mouse y touch)
  - Sistema de callbacks para eventos de movimiento
- `getUserLocation()`: Usa Geolocation API + Nominatim para obtener ubicación del usuario

**Cómo se usa:**

- Se importa dinámicamente: `const { initMap, getUserLocation } = await import('./scripts/map.ts')`
- Se llama `initMap(mapContainer, [lng, lat], zoom)` retorna `MapInstance`
- Se registran callbacks: `mapInstance.onMoveEnd(updateWeatherForLocation)`
- Se usa para volar a ubicaciones: `mapInstance.flyTo(location)`

---

### 3. weather.ts (178 líneas)

**Qué hace:**
Módulo de integración con APIs meteorológicas y geocoding. Proporciona funciones para obtener datos del clima, buscar ciudades, y realizar geocoding inverso.

**Para qué sirve:**
Abstrae todas las llamadas a APIs externas (Open-Meteo y Nominatim) con sistema de caché para evitar llamadas repetidas.

**Qué contiene:**

_Constantes:_

- `WEATHER_API`: `'https://api.open-meteo.com/v1/forecast'` - API de clima (gratuita, sin API key)
- `GEOCODING_API`: `'https://geocoding-api.open-meteo.com/v1/search'` - API de geocoding (gratuita)
- `CACHE_TTL`: 5 minutos (300,000 ms)

_Funciones:_

- `getWeatherState(code, isDay)`: Convierte weather code WMO a estado interno (`storm`, `sunny`, `fog`, `rain`, `snow`, `clear`)
- `getCacheKey(lat, lng)`: Genera clave de caché redondeando coordenadas a 1 decimal
- `fetchWeather(lat, lng)`: Obtiene datos meteorológicos actuales con caché de 5 minutos
  - Parámetros: temperature_2m, relative_humidity_2m, apparent_temperature, precipitation, weather_code, cloud_cover, wind_speed_10m, wind_direction_10m, is_day
- `searchCities(query, count)`: Busca ciudades por nombre (mínimo 2 caracteres)
- `reverseGeocode(lat, lng)`: Convierte coordenadas a nombre de ciudad usando Nominatim
- `getWindDirectionLabel(direction)`: Convierte dirección en grados a etiqueta cardinal (N, NE, E, etc.)
- `getWeatherDescription(code, language)`: Retorna descripción del clima en español o inglés

_Caché:_

- `weatherCache`: Map para datos meteorológicos (TTL 5 min)
- `locationCache`: Map para geocoding inverso (sin TTL, persiste en sesión)

**Cómo se usa:**

- Se importa dinámicamente: `const { fetchWeather, reverseGeocode, searchCities } = await import('./scripts/weather.ts')`
- Se llama `await fetchWeather(lat, lng)` retorna `WeatherData`
- Se llama `await reverseGeocode(lat, lng)` retorna `GeoLocation`
- Se usa en barra de búsqueda: `await searchCities(query, 5)`

---

### 4. particles.ts (294 líneas)

**Qué hace:**
Sistema de partículas para lluvia y nieve con física completa, colisión con elementos UI, y efecto de inercia al arrastrar el mapa.

**Para qué sirve:**
Crea efectos visuales de precipitación que reaccionan al clima actual y al movimiento del usuario, mejorando la inmersión visual.

**Qué contiene:**

_Constantes:_

- `PARTICLE_CONFIGS`: Configuraciones predefinidas para lluvia y nieve:
  - `rain`: 250 partículas, velocidad 14, gravedad 0.5
  - `snow`: 120 partículas, velocidad 2.5, gravedad 0.15
- `COLLISION_ELEMENT_IDS`: Lista de IDs de elementos UI para colisión

_Clase `ParticleSystem`:_

- **Constructor**: Inicializa canvas y contexto 2D
- **Métodos públicos:**
  - `resize()`: Ajusta canvas a dimensiones de ventana con DPR
  - `setWeather(state)`: Activa/desactiva partículas según estado meteorológico
  - `setWind(vx, vy)`: Establece dirección del viento
  - `addInertia(vx, vy)`: Añade inercia al arrastrar (decae con `decayInertia`)
  - `stop()`: Detiene animación y limpia partículas
  - `destroy()`: Limpia recursos
- **Métodos privados:**
  - `updateCollisionBoxes()`: Calcula bounding boxes de elementos UI ( cada 100ms)
  - `checkCollision(p)`: Verifica colisión de partícula con elementos UI
  - `bounceParticle(p)`: Rebota partícula contra elemento UI
  - `createParticle()`: Crea nueva partícula con propiedades aleatorias
  - `update()`: Actualiza física de partículas (posición, vida, colisiones)
  - `draw()`: Renderiza partículas en canvas (lluvia como líneas, nieve como círculos con glow)
  - `animate()`: Loop de animación con requestAnimationFrame

**Cómo se usa:**

- Se importa dinámicamente: `const { ParticleSystem } = await import('./scripts/particles.ts')`
- Se instancia: `state.particleSystem = new ParticleSystem(particleCanvas)`
- Se configura: `particleSystem.setWeather(weather.state)`
- Se actualiza viento: `particleSystem.setWind(vx, vy)`
- Se conecta a drag: `mapInstance.onDrag((v) => particleSystem.addInertia(v.vx, v.vy))`

---

### 5. gradients.ts (100 líneas)

**Qué hace:**
Define los temas visuales para cada estado meteorológico y proporciona funciones de interpolación de colores para transiciones suaves.

**Para qué sirve:**
Centraliza la configuración visual de cada estado climático y permite transiciones fluidas entre ellos mediante interpolación de colores.

**Qué contiene:**

_Constantes:_

- `WEATHER_THEMES`: Mapa de temas por estado:
  - `storm`: Degradado púrpura oscuro, partículas lluvia, opacidad 0.8
  - `sunny`: Degradado ámbar/naranja, sin partículas, opacidad 0.5
  - `fog`: Degradado gris claro, sin partículas, opacidad 0.7
  - `rain`: Degradado azul, partículas lluvia, opacidad 0.6
  - `snow`: Degradado índigo claro, partículas nieve, opacidad 0.55
  - `clear`: Degradado azul cielo, sin partículas, opacidad 0.45

_Funciones:_

- `hexToRgb(hex)`: Convierte hex a array RGB
- `rgbToHex(r, g, b)`: Convierte RGB a hex
- `lerpColor(color1, color2, t)`: Interpola linealmente entre dos colores
- `interpolateTheme(from, to, progress)`: Interpola entre dos temas completos con suavizado (smoothstep)
- `getGradientCSS(theme)`: Genera CSS de gradiente radial
- `getThemeForState(state)`: Retorna tema para un estado meteorológico

**Cómo se usa:**

- Se importa dinámicamente: `const { getThemeForState } = await import('./scripts/gradients.ts')`
- Se llama `getThemeForState(weather.state)` para obtener tema actual
- Se usa `interpolateTheme()` para transiciones (aunque actualmente no se usa directamente en el código)

---

### 6. metaballs.ts (231 líneas)

**Qué hace:**
Efecto de transición orgánica tipo "metaballs" usando SVG filters y canvas. Crea blobs de color que se mueven y fusionan durante los cambios de estado meteorológico.

**Para qué sirve:**
Proporciona una transición visual llamativa y fluida cuando el usuario se mueve entre regiones con diferentes condiciones climáticas.

**Qué contiene:**

_Interfaces:_

- `TransitionState`: Estado de la transición actual:
  - `isTransitioning`: Flag de transición activa
  - `progress`: Progreso de 0 a 1
  - `fromColors` / `toColors`: Colores de inicio y fin
  - `startTime` / `duration`: Timing de la transición

_Constantes:_

- `TRANSITION_DURATION`: 1800ms (1.8 segundos)

_Clase `MetaballTransition`:_

- **Constructor**: Crea elemento SVG con filtro de metaballs:
  - `feGaussianBlur`: Desenfoque gaussiano (stdDeviation=12)
  - `feColorMatrix`: Matriz de umbral para efecto metaball (valores: `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8`)
  - `feComposite`: Composición con imagen original
- **Métodos públicos:**
  - `resize()`: Ajusta canvas a dimensiones de ventana con DPR
  - `startTransition(fromColors, toColors)`: Inicia transición con 4 blobs:
    - Blob 1: Superior izquierdo → inferior derecho
    - Blob 2: Inferior derecho → superior izquierdo
    - Blob 3: Superior centro → inferior centro
    - Blob 4: Inferior centro → superior centro
  - `isActive()`: Retorna si hay transición activa
  - `destroy()`: Limpia recursos
- **Métodos privados:**
  - `easeInOutCubic(t)`: Función de suavizado cúbica
  - `animate()`: Loop de animación que:
    - Calcula progreso con easing
    - Renderiza blobs con gradientes radiales
    - Aplica pulso sinusoidal al radio
    - Ajusta opacidad del canvas
  - `finishTransition()`: Limpia estado al finalizar

**Cómo se usa:**

- Se importa dinámicamente: `const { MetaballTransition } = await import('./scripts/metaballs.ts')`
- Se instancia: `state.metaballTransition = new MetaballTransition(overlay, canvas)`
- Se activa: `metaballTransition.startTransition(fromTheme.gradient, toTheme.gradient)`
- Se llama automáticamente cuando `previousState !== newState` en el callback `onMoveEnd`

---

### 7. types.ts (56 líneas)

**Qué hace:**
Define todas las interfaces y tipos TypeScript utilizados en la aplicación.

**Qué contiene:**

- `WeatherState`: Union type `'storm' | 'sunny' | 'fog' | 'rain' | 'snow' | 'clear'`
- `WeatherTheme`: Tema visual con gradient, particleType, particleDensity, overlayOpacity
- `WeatherData`: Datos meteorológicos completos (temperatura, humedad, viento, etc.)
- `GeoLocation`: Ubicación geográfica con nombre, país, administración1
- `MapCamera`: Estado de la cámara del mapa (center, zoom, bearing, pitch)
- `Particle`: Propiedades de una partícula (posición, velocidad, vida, etc.)
- `Config`: Configuración del sistema de partículas

---

## Flujo de Ejecución (Paso a Paso)

### 1. Carga Inicial (Usuario entra a `/es/aura_weather`)

```
1. Astro renderiza la página aura_weather.astro
2. Se importa el Layout y AuraWeatherApp (App.astro)
3. Se extraen datos del frontmatter (title, description, etc.)
4. App.astro renderiza la estructura HTML completa
5. El script inline se ejecuta automáticamente
```

### 2. Inicialización de la Aplicación (App.astro script)

```
1. Se obtiene referencia al root element (#aura-weather-root)
2. Se lee el estado inicial del DOM (idioma, placeholders, unidad de temperatura)
3. Se inicializa el objeto state con valores null
4. Se llama initSearch() para configurar la barra de búsqueda
5. Se muestra el overlay de carga (showLoading())
6. Se importan dinámicamente todos los módulos:
   - map.ts (initMap, getUserLocation)
   - weather.ts (fetchWeather, reverseGeocode)
   - gradients.ts (getThemeForState)
   - particles.ts (ParticleSystem)
   - metaballs.ts (MetaballTransition)
```

### 3. Inicialización del Mapa

```
1. Se obtiene ubicación del usuario via Geolocation API
   - Si falla, se usa Bogotá como fallback [4.6097, -74.0817]
2. Se llama initMap(mapContainer, [lng, lat], zoom)
3. MapLibre crea el mapa con estilo OpenFreeMap
4. Se agrega control de navegación (bottom-right)
5. Se configuran event listeners:
   - mousedown/mousemove/mouseup para drag tracking
   - touchstart/touchmove/touchend para mobile
   - map.on('move') y map.on('moveend') para callbacks
6. Se retorna MapInstance con API simplificada
```

### 4. Inicialización de Efectos Visuales

```
1. Se obtienen canvas del DOM:
   - #weather-particles para sistema de partículas
   - #metaball-canvas para efecto metaballs
2. Se instancia ParticleSystem(particleCanvas)
   - Configura canvas con DPR correcto
   - Prepara sistema de colisión con elementos UI
3. Se instancia MetaballTransition(overlay, canvas)
   - Crea elemento SVG oculto con filtro metaball
   - Prepara 4 blobs para animación
```

### 5. Primera Carga de Datos Meteorológicos

```
1. Se obtiene cámara inicial del mapa (getCamera())
2. Se llama updateWeatherForLocation(camera)
3. Se ejecutan en paralelo:
   - fetchWeather(lat, lng) → Open-Meteo API
   - reverseGeocode(lat, lng) → Nominatim API
4. Se procesan resultados:
   - Se mapea weather_code a WeatherState (storm, sunny, etc.)
   - Se obtiene tema visual con getThemeForState(state)
5. Se actualiza UI:
   - updateGradient(theme) → Aplica gradiente radial al overlay
   - updateWeatherInfo(weather, location) → Actualiza texto en DOM
   - Se actualiza input de búsqueda con nombre de ciudad
6. Se configuran partículas según clima:
   - Si rain/storm: particleSystem.setWeather('rain')
   - Si snow: particleSystem.setWeather('snow')
   - Se establece dirección del viento
7. Se oculta overlay de carga (hideLoading())
```

### 6. Interacción del Usuario

```
Al mover el mapa (drag/scroll/zoom):
1. MapLibre emite evento 'move' → callbacks onMove()
2. Cuando termina el movimiento → evento 'moveend'
3. Se llama updateWeatherForLocation(camera)
4. Se verifica si la ubicación cambió (debounce por zona)
5. Si cambió:
   a. Se obtienen nuevos datos del clima
   b. Si el estado cambió (ej: de 'sunny' a 'rain'):
      - Se muestra indicador de transición
      - Se activa metaballTransition.startTransition()
      - Se actualiza gradiente y partículas
      - Tras 1800ms se oculta indicador
   c. Si el estado no cambió:
      - Solo se actualiza gradiente y partículas

Al buscar una ciudad:
1. Usuario escribe en #search-input
2. Tras 300ms de debounce → searchCities(query)
3. Se muestra dropdown con resultados
4. Al seleccionar → mapInstance.flyTo(city)
5. Se dispara evento moveend → ciclo normal

Al usar botón de ubicación:
1. Se muestra loading
2. Se llama getUserLocation() (Geolocation API + Nominatim)
3. Se ejecuta mapInstance.flyTo(location)
4. Se oculta loading

Al hacer clic en botón de demostración (#demo-btn):
1. Se verifica que no haya un demo en ejecución
2. Se deshabilita el botón (opacity + pointer-events)
3. Se guarda el estado actual (tema, weather, location, prevState)
4. Se inicia ciclo de 6 estados (3s cada uno):
   Para cada estado:
     a. Se obtiene tema visual con getThemeForState()
     b. Se muestra indicador de transición
     c. Se activa transición metaball (from → to gradientes)
     d. Se actualiza gradiente overlay
     e. Se crea datos fake (weather + location)
     f. Se actualiza panel de información
     g. Se configuran partículas según estado
     h. Se espera 3000ms
5. Al finalizar:
   a. Se restaura tema visual original
   b. Se restauran datos meteorológicos reales
   c. Se restaura ubicación en input de búsqueda
   d. Se re-habilita el botón de demostración
```

---

## Gestión de APIs y Datos

### APIs Utilizadas

| API                      | URL                                              | Uso                                      | Requiere API Key                  |
| ------------------------ | ------------------------------------------------ | ---------------------------------------- | --------------------------------- |
| **Open-Meteo Weather**   | `https://api.open-meteo.com/v1/forecast`         | Datos meteorológicos actuales            | **NO** (gratuita)                 |
| **Open-Meteo Geocoding** | `https://geocoding-api.open-meteo.com/v1/search` | Búsqueda de ciudades                     | **NO** (gratuita)                 |
| **Nominatim**            | `https://nominatim.openstreetmap.org/reverse`    | Geocoding inverso (coordenadas → nombre) | **NO** (gratuita, con rate limit) |
| **OpenFreeMap Tiles**    | `https://tiles.openfreemap.org/styles/liberty`   | Estilo del mapa                          | **NO** (gratuita)                 |

### Variables de Entorno

**No se requieren API keys para esta aplicación.** Todas las APIs utilizadas son gratuitas y no requieren autenticación.

Sin embargo, si se desea usar un estilo de mapa diferente (ej: Mapbox, Google Maps), se necesitaría configurar:

```env
# Opcional: Solo si se cambia el proveedor de mapas
MAPBOX_ACCESS_TOKEN=tu_token_aquí

# Opcional: Solo si se usa una API de clima con autenticación
WEATHER_API_KEY=tu_api_key_aquí
```

### Caché

- **Datos meteorológicos**: Caché en memoria con TTL de 5 minutos, key por coordenadas (redondeadas a 1 decimal)
- **Geocoding inverso**: Caché en memoria sin TTL (persiste durante la sesión)
- **Búsqueda de ciudades**: Sin caché (cada búsqueda es una llamada nueva)

### Rate Limits

- **Nominatim**: Máximo 1 request por segundo (el código no implementa rate limiting explícito)
- **Open-Meteo**: Sin límite documentado para uso normal
- **OpenFreeMap**: Sin límite documentado

---

## Estructura de Contenido

### Frontmatter (es.md / en.md)

```yaml
---
title: "El Espejo del Clima" # Título de la página
description: "..." # Descripción para SEO
searchPlaceholder: "Buscar ciudad..." # Placeholder del input
locationButton: "Mi ubicación" # Texto del botón de ubicación
temperatureUnit: "°C" # Unidad de temperatura
windLabel: "Viento" # Etiqueta de viento
humidityLabel: "Humedad" # Etiqueta de humedad
feelsLikeLabel: "Sensación" # Etiqueta de sensación térmica
loadingText: "Cargando..." # Texto de carga
demoButton: "Demostración" # Texto del botón de demostración
---
```

### Content Collections

Astro maneja el contenido mediante content collections. Los archivos `.md` en `src/content/demos/aura_weather/` se importan como módulos con `frontmatter` y `Content`.

---

## Modo de Demostración (Demo Mode)

### Descripción General

El **Modo de Demostración** es una funcionalidad integrada en la barra de búsqueda que permite al usuario visualizar todos los estados climáticos disponibles de forma automática, sin necesidad de navegar el mapa o buscar ciudades específicas. Está diseñado como herramienta de presentación para mostrar las capacidades visuales de la aplicación de manera rápida e intuitiva.

### Ubicación y Acceso

El botón de demostración se encuentra **dentro de la barra de búsqueda**, posicionado a la derecha del botón de ubicación (crosshair). Ambos botones están contenidos en un `div` flex con clase `absolute right-2 flex items-center gap-1` que los mantiene alineados horizontalmente sin superposición.

**Elemento HTML:**

```html
<div class="absolute right-2 flex items-center gap-1">
  <button id="location-btn" ...>  <!-- Botón de ubicación -->
  <button id="demo-btn" ...>      <!-- Botón de demostración -->
</div>
```

**Estilo visual:**

- Mismo estilo glass-morphism que los controles existentes
- Fondo: `bg-black/40 backdrop-blur-xl`
- Borde: `border-white/10 rounded-xl`
- Separador visual: `border-l border-white/10 pl-3` entre los dos botones
- Ícono SVG de play circulado (path de `M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z` + `M21 12a9 9 0 11-18 0 9 9 0 0118 0z`)
- Tooltip: Texto localizado (`demoButton` del frontmatter)

### Flujo de Ejecución del Demo

```
1. Usuario hace clic en #demo-btn
2. Se verifica que no haya un demo en ejecución (isDemoRunning === false)
3. Se deshabilita el botón (opacity: 0.4, pointer-events: none)
4. Se guarda el estado actual:
   - savedTheme: Tema visual activo
   - savedWeather: Datos meteorológicos actuales
   - savedLocation: Ubicación actual
   - savedPrevState: Estado climático anterior
5. Se inicia el ciclo de 6 estados (3 segundos cada uno):
   Para cada estado en DEMO_STATES:
     a. Se obtiene el tema visual con getThemeForState(state)
     b. Se calcula el tema de origen (anterior o actual guardado)
     c. Se muestra indicador de transición con texto localizado
     d. Se activa transición metaball (fromTheme.gradient → toTheme.gradient)
     e. Se actualiza gradiente overlay con updateGradient(theme)
     f. Se crea objeto fakeWeather con datos predefinidos
     g. Se crea objeto fakeLocation con nombre de ciudad ficticio
     h. Se actualiza panel de info con updateWeatherInfo()
     i. Se actualiza input de búsqueda con nombre de ciudad fake
     j. Se configuran partículas según el estado
     k. Se espera 3000ms (await new Promise)
6. Al finalizar el ciclo:
   a. Se restaura el tema visual original
   b. Se restauran los datos meteorológicos reales
   c. Se restaura la ubicación original en el input
   d. Se detienen las partículas si no hay clima activo
   e. Se oculta el indicador de transición
   f. Se re-habilita el botón de demostración
```

### Estados Climáticos del Demo

El ciclo recorre los 6 estados en el siguiente orden:

| #   | Estado  | Temp | Viento  | Humedad | Sensación | Ciudad Fake           | Descripción (ES/EN)                 |
| --- | ------- | ---- | ------- | ------- | --------- | --------------------- | ----------------------------------- |
| 1   | `storm` | 18°  | 45 km/h | 92%     | 14°       | Ciudad de la Tormenta | Tormenta detectada / Storm detected |
| 2   | `rain`  | 14°  | 30 km/h | 85%     | 11°       | Puerto de Lluvia      | Lluvia detectada / Rain detected    |
| 3   | `snow`  | -3°  | 15 km/h | 78%     | -7°       | Montaña Nevada        | Nieve detectada / Snow detected     |
| 4   | `fog`   | 10°  | 8 km/h  | 95%     | 8°        | Valle de Niebla       | Niebla detectada / Fog detected     |
| 5   | `sunny` | 32°  | 12 km/h | 35%     | 34°       | Playa Soleada         | Clima soleado / Sunny weather       |
| 6   | `clear` | 22°  | 10 km/h | 50%     | 21°       | Lago Despejado        | Clima despejado / Clear weather     |

### Animaciones Activadas por Estado

Cada estado del demo activa las siguientes animaciones:

| Estado  | Gradiente                          | Partículas              | Metaball                | Opacidad |
| ------- | ---------------------------------- | ----------------------- | ----------------------- | -------- |
| `storm` | Púrpura oscuro (#1a0a2e → #1e3a5f) | Lluvia (250 partículas) | Sí (en cada transición) | 0.8      |
| `rain`  | Azul (#1e3a5f → #60a5fa)           | Lluvia (250 partículas) | Sí                      | 0.6      |
| `snow`  | Índigo claro (#e0e7ff → #818cf8)   | Nieve (120 partículas)  | Sí                      | 0.55     |
| `fog`   | Gris (#6b7280 → #a7f3d0)           | Ninguna                 | Sí                      | 0.7      |
| `sunny` | Ámbar (#f59e0b → #92400e)          | Ninguna                 | Sí                      | 0.5      |
| `clear` | Azul cielo (#0c4a6e → #0284c7)     | Ninguna                 | Sí                      | 0.45     |

### Datos Fake por Estado

Cada estado muestra datos meteorológicos ficticios en el panel de información:

```javascript
const DEMO_STATES = [
  { state: "storm", temp: 18, wind: 45, humidity: 92, feelsLike: 14 },
  { state: "rain", temp: 14, wind: 30, humidity: 85, feelsLike: 11 },
  { state: "snow", temp: -3, wind: 15, humidity: 78, feelsLike: -7 },
  { state: "fog", temp: 10, wind: 8, humidity: 95, feelsLike: 8 },
  { state: "sunny", temp: 32, wind: 12, humidity: 35, feelsLike: 34 },
  { state: "clear", temp: 22, wind: 10, humidity: 50, feelsLike: 21 },
];
```

### Ciudades Ficticias

El demo muestra nombres de ciudades ficticias en el input de búsqueda y en el panel de información:

| Estado | Ciudad                | País |
| ------ | --------------------- | ---- |
| storm  | Ciudad de la Tormenta | Demo |
| rain   | Puerto de Lluvia      | Demo |
| snow   | Montaña Nevada        | Demo |
| fog    | Valle de Niebla       | Demo |
| sunny  | Playa Soleada         | Demo |
| clear  | Lago Despejado        | Demo |

### Sistema de Protección del Demo

Para evitar conflictos durante la ejecución:

1. **Flag `isDemoRunning`**: Variable booleana que bloquea ejecuciones múltiples
2. **Deshabilitación del botón**: Durante el ciclo, el botón se deshabilita visualmente (opacity: 0.4) y funcionalmente (pointer-events: none)
3. **Restauración del estado**: Al finalizar, se restauran todos los valores originales (tema, datos, ubicación, partículas)
4. **Guard de metaballs**: El sistema de metaballs tiene su propio guard (`if (this.state.isTransitioning) return`) que previene transiciones simultáneas

### Soporte i18n

El botón de demostración soporta internacionalización:

- **Español**: `demoButton: "Demostración"` (en `es.md`)
- **Inglés**: `demoButton: "Demo"` (en `en.md`)
- **Descripciones de transición**: Reutiliza el diccionario `demoDescriptions` con los mismos textos del sistema de transición normal
- **Labels del panel**: Los datos fake usan las mismas etiquetas i18n que el clima real (`windLabel`, `humidityLabel`, `feelsLikeLabel`)

### Estructura de Datos del Demo

```javascript
// Datos fake para cada estado
const fakeWeather = {
  temperature: demo.temp,
  apparentTemperature: demo.feelsLike,
  humidity: demo.humidity,
  weatherCode: 0,
  cloudCover: 0,
  windSpeed: demo.wind,
  windDirection: 180, // Sur (constante para efecto visual)
  precipitation: 0,
  isDay: true, // Siempre día para colores consistentes
  state: demo.state,
};

// Ubicación ficticia
const fakeLocation = {
  latitude: 0,
  longitude: 0,
  name: "Ciudad de la Tormenta", // Varía según estado
  country: "Demo",
  admin1: "",
};
```

### Timing del Ciclo

- **Duración por estado**: 3000ms (3 segundos)
- **Duración de transición metaball**: 1800ms (1.8 segundos)
- **Total del ciclo**: ~18 segundos (6 estados × 3 segundos)
- **Indicador de transición**: Se oculta a los 1800ms de cada cambio

---

## Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview de producción
npm run preview
```

---

## Estado Actual

- Implementación completa con soporte i18n (es/en)
- Efectos de metaballs implementados y funcionales
- Sistema de partículas con lluvia y nieve
- Integración con Open-Meteo (sin API key)
- Integración con MapLibre/OpenFreeMap (sin API key)
- Caché en memoria para optimizar llamadas
- Responsive design
- **Modo de demostración** integrado en la barra de búsqueda
- Listo para despliegue o desarrollo adicional

---

## Posibles Mejoras / Tareas Pendientes (Roadmap)

1. **Manejo robusto de errores de API:** Actualmente los errores se capturan con `console.error` pero no muestran feedback al usuario. Implementar un sistema de notificaciones toast que muestre mensajes amigables cuando falla la conexión a Open-Meteo o Nominatim, con opción de reintentar.

2. **Optimización de rendimiento del mapa:** Reducir la frecuencia de llamadas a la API del clima durante el movimiento continuo del mapa. Actualmente se usa un debounce por zona geográfica, pero se podría implementar un throttle adicional o cargar datos meteorológicos en tiles pre-calcualados.

3. **Precarga de datos meteorológicos:** Implementar un sistema de precarga que anticipe la dirección del usuario y cargue datos del clima de las regiones cercanas antes de que llegue a ellas, eliminando el parpadeo visual al cambiar de zona.

4. **Animaciones de transición mejoradas:** Actualmente los metaballs y gradientes se actualizan por separado. Unificar ambos sistemas en una única transición coordinada con sincronización perfecta entre el movimiento de blobs, cambio de gradiente y aparición/desaparición de partículas.

5. ~~**Modo de demostración:**~~ Completado. Botón integrado en la barra de búsqueda que cicla por los 6 estados climáticos con animaciones completas (gradientes, partículas, metaballs, panel de info) durante 3 segundos cada uno.
