# Guía de uso SVGInjector

## ¿Qué hace esta clase?

La clase `SVGInjector` carga automáticamente archivos SVG desde una configuración JSON y los mantiene en memoria para acceso rápido.

## Cómo se generan las claves

Las claves se generan según la estructura del JSON:

### Casos de uso:

1. **Con subtipo numérico o string**: `"tipo.subtipo"`
   ```json
   "R": { "1": {...} }  →  Clave: "R.1"
   "R": { "2": {...} }  →  Clave: "R.2"
   ```

2. **Sin subtipo (clave vacía `""`)**: `"tipo"`
   ```json
   "g": { "": {...} }  →  Clave: "g"
   "r": { "": {...} }  →  Clave: "r"
   ```

3. **Iconos con subcategorías**:
   ```json
   "weather": {
     "drizzle": {...}  →  Clave: "weather.drizzle"
     "sunny": {...}     →  Clave: "weather.sunny"
   }
   ```

4. **Iconos simples (clave vacía)**:
   ```json
   "build": { "": {...} }  →  Clave: "build"
   "money": { "": {...} }  →  Clave: "money"
   ```

## Uso básico

### 1. Crear instancia y cargar SVGs

```javascript
// Sin modo debug
const builds = await SVGInjector.create(data.builds);
const icons = await SVGInjector.create(data.icons);

// Con modo debug (recomendado para desarrollo)
const builds = await SVGInjector.create(data.builds, true);
const icons = await SVGInjector.create(data.icons, true);
```

### 2. Obtener modelos SVG

```javascript
// ===== EDIFICIOS =====
// Residencial
builds.getModel('R.1')  // Casa nivel 1
builds.getModel('R.2')  // Apartamentos nivel 2

// Comercial
builds.getModel('C.1')  // Tienda nivel 1
builds.getModel('C.2')  // Centro comercial nivel 2

// Industrial
builds.getModel('I.1')  // Fábrica nivel 1
builds.getModel('I.2')  // Granja nivel 2

// Parque
builds.getModel('P.1')  // Parque

// Servicios
builds.getModel('S.1')  // Estación de policía
builds.getModel('S.2')  // Estación de bomberos
builds.getModel('S.3')  // Hospital

// Utilidades
builds.getModel('U.1')  // Planta de energía
builds.getModel('U.2')  // Planta de agua

// Terreno y caminos (claves simples sin subtipo)
builds.getModel('g')    // Terreno vacío (ground)
builds.getModel('r')    // Camino (road/way)

// ===== ICONOS =====
// Iconos simples
icons.getModel('build')      // Ícono construcción
icons.getModel('energy')     // Ícono energía
icons.getModel('water')      // Ícono agua
icons.getModel('money')      // Ícono dinero
icons.getModel('food')       // Ícono comida
icons.getModel('move')       // Ícono mover
icons.getModel('news')       // Ícono noticias
icons.getModel('resource')   // Ícono recursos
icons.getModel('statistics') // Ícono estadísticas
icons.getModel('touch')      // Ícono tocar

// Iconos de clima (con subcategorías)
icons.getModel('weather.drizzle')
icons.getModel('weather.sunny')
icons.getModel('weather.sunny-low')
icons.getModel('weather.partly-cloudy-day')
icons.getModel('weather.partly-cloudy-night')
icons.getModel('weather.rain-showers-day')
icons.getModel('weather.rain-showers-night')
icons.getModel('weather.snow-showers-day')
icons.getModel('weather.snow-showers-night')
icons.getModel('weather.thunderstorm')
icons.getModel('weather.hail-day')
icons.getModel('weather.hail-night')
```

### 3. Verificar disponibilidad

```javascript
// Verificar si existe un modelo antes de usarlo
if (builds.hasModel('R.1')) {
  const svg = builds.getModel('R.1');
  // Usar el SVG
}

if (builds.hasModel('g')) {
  const groundSvg = builds.getModel('g');
  // Renderizar terreno
}
```

### 4. Métodos auxiliares

```javascript
// Obtener todas las claves disponibles
const buildKeys = builds.getModelKeys();
console.log(buildKeys);
// ['R.1', 'R.2', 'C.1', 'C.2', 'I.1', 'I.2', 'P.1', 'S.1', 'S.2', 'S.3', 'U.1', 'U.2', 'g', 'r']

const iconKeys = icons.getModelKeys();
console.log(iconKeys);
// ['build', 'energy', 'water', 'money', ..., 'weather.drizzle', 'weather.sunny', ...]

// Obtener estadísticas
const stats = builds.getStats();
console.log(stats.total);     // 14 (total de modelos)
console.log(stats.modelos);   // Array con todas las claves
```

## Ejemplo completo

```javascript
City.initConfig().then(async (data) => {
  try {
    // Cargar SVGs con modo debug activo
    const builds = await SVGInjector.create(data.builds, true);
    const icons = await SVGInjector.create(data.icons, true);

    // Verificar carga
    console.log('✓ Construcciones cargadas:', builds.getStats().total);
    console.log('✓ Iconos cargados:', icons.getStats().total);

    // Ejemplo: renderizar mapa
    const layout = [
      ['R1', 'g', 'g', 'C1'],
      ['r', 'r', 'r', 'r'],
      ['g', 'g', 'P1', 'g']
    ];

    layout.forEach((row, i) => {
      row.forEach((cell, j) => {
        // Convertir notación de mapa a clave de SVG
        let key = cell;
        if (cell.length > 1 && cell !== 'g' && cell !== 'r') {
          // Separar tipo de nivel: "R1" → "R.1"
          key = `${cell[0]}.${cell.slice(1)}`;
        }
        
        const svg = builds.getModel(key);
        if (svg) {
          renderCell(i, j, svg);
        }
      });
    });

    // Ejemplo: mostrar ícono del clima
    const weatherIcon = icons.getModel('weather.sunny');
    document.querySelector('.weather').innerHTML = weatherIcon;

  } catch (error) {
    console.error('❌ Error al cargar los SVG:', error);
  }
});
```

## Características

✅ **Carga paralela** - Todos los SVG se cargan simultáneamente para optimizar rendimiento  
✅ **Claves intuitivas** - Usa formato punto `"tipo.subtipo"` o simple `"tipo"`  
✅ **Soporte de claves vacías** - Maneja correctamente `"g": { "": {...} }` → `"g"`  
✅ **Modo debug** - Ver logs de carga en consola  
✅ **Validación** - Errores descriptivos si falla la carga  
✅ **Métodos auxiliares** - Verificación de existencia, listado de claves, estadísticas  
✅ **Auto-limpieza** - Elimina código de live-server automáticamente

## Manejo de errores

```javascript
try {
  const builds = await SVGInjector.create(data.builds, true);
} catch (error) {
  console.error('Error al cargar:', error.message);
  // Manejar error apropiadamente
}
```

## Notas importantes

- Siempre usar `await` o `.then()` al crear instancias (es asíncrono)
- Las claves son case-sensitive: `'R.1'` ≠ `'r.1'`
- Los modelos retornados son strings con contenido SVG
- El modo debug es útil para verificar qué claves se están generando
