# Sistema de Carga de Mapas - Documentación

## Descripción General

El sistema de carga de mapas permite a los usuarios cargar archivos `.txt` con mapas predefinidos al crear una ciudad. El sistema parsea el archivo, valida el formato, calcula automáticamente los recursos iniciales basándose en los edificios y guarda el mapa en localStorage para su renderización.

## Flujo Completo

### 1. Carga de Archivo
```
Usuario selecciona archivo .txt
    ↓
FileReader lee contenido
    ↓
MapFileParser.parseMapFile() valida
    ↓
Si válido: muestra éxito + estadísticas
Si error: muestra error con línea específica
```

### 2. Cálculo de Recursos
```
Usuario hace click en "🎯 Auto-Llenar" (opcional)
    ↓
MapResourceCalculator.calculateInitialResources()
    ↓
Inspecciona cada edificio del mapa
    ↓
Suma producción de energía, agua, alimento
    ↓
Rellena campos automáticamente
```

### 3. Creación de Ciudad
```
Usuario completa formulario y click "Crear Ciudad"
    ↓
CityCreationController.createCityData()
    ↓
- Usa layout cargado si existe, si no, crea vacío
- Usa tamaño del layout cargado si existe
- Suma recursos calculados + manuales
    ↓
MapPersistenceService.saveMapLayout()
    ↓
CityBuilderInitializer carga layout desde localStorage
    ↓
MapRenderer renderiza edificios del layout
```

## Formatos de Archivo Soportados

### Notación de Celdas

Cada celda del mapa es un string de 1-2 caracteres. El primer carácter es el tipo de construcción, el segundo (opcional) es el subtipo.

```
g  = Ground (terreno)
r  = Road (camino)

R#
R1 = Casa residencial
R2 = Apartamentos

C#
C1 = Tienda
C2 = Centro comercial

I#
I1 = Fábrica
I2 = Granja

S#
S1 = Estación de policía
S2 = Estación de bomberos
S3 = Hospital

U#
U1 = Central eléctrica
U2 = Tratamiento de agua

P#
P1 = Parque
```

### Estructura del Archivo

- Dimensiones: 15x15 a 30x30 celdas
- Separador: espacios o tabulaciones
- Una fila por línea
- Todas las filas deben tener el mismo número de columnas

### Ejemplo: `example_map.txt`

```
g g g g g g g g g g g g g g g
g g g g g g g g g g g g g g g
g R1 r C1 r R2 r g g g g g g g
g r S1 r S1 r g g g g g g g g
g g r g r g g g g g g g g g g
g U1 r I1 r P1 g g g g g g g g
g r r r r r g g g g g g g g g
g g g g g g g g g g g g g g g
... (más filas)
```

Este es un mapa 15x15 con:
- 2 casas residenciales (R1)
- 1 tienda (C1)
- 1 apartamento (R2)
- 2 estaciones de policía (S1)
- 1 central eléctrica (U1)
- 1 granja (I1)
- 1 parque (P1)
- Caminos conectando los edificios

## Servicios Implementados

### MapFileParser
**Ubicación:** `domain/services/mapFileParser.js`

```javascript
MapFileParser.parseMapFile(content)
Returns: {
  valid: boolean,
  layout: string[][], // Si válido
  error: string,      // Si inválido
  errorRow: number,   // Fila con error
  size: number,
  stats: {
    groundCells: number,
    roadCells: number,
    buildings: { R: 2, C: 1, ... }
  }
}
```

### MapResourceCalculator
**Ubicación:** `domain/services/mapResourceCalculator.js`

```javascript
MapResourceCalculator.calculateInitialResources(layout, buildsConfig)
Returns: {
  money: 50000,
  energy: number,     // Suma de producción de U1, U2
  water: number,      // Suma de producción de U2
  food: number        // Suma de producción de I2
}
```

### MapLayoutConverter
**Ubicación:** `domain/services/mapLayoutConverter.js`

Convierte entre diferentes formatos de mapa:

```javascript
// String layout a Building objects
MapLayoutConverter.layoutToBuildingGrid(layout, buildsConfig, svgModels)

// Building objects a string layout
MapLayoutConverter.gridToLayout(grid)

// Validar layout
MapLayoutConverter.validateLayoutAgainstConfig(layout, buildsConfig)
```

### MapPersistenceService
**Ubicación:** `domain/services/mapPersistenceService.js`

Maneja persistencia en localStorage:

```javascript
// Guardar mapa
MapPersistenceService.saveMapLayout(layout, metadata)

// Cargar mapa
MapPersistenceService.loadMapLayout()

// Información del mapa sin cargar todo
MapPersistenceService.getMapInfo()

// Limpiar mapa
MapPersistenceService.clearMapLayout()
```

## Validaciones y Errores

### Validaciones del Archivo
1. **Dimensiones:** 15x15 a 30x30
2. **Formato rectangular:** Todas las filas con igual número de columnas
3. **Notación válida:** Cada celda debe ser tipo+subtype válido
4. **Caracteres válidos:** Solo soporta tipos definidos en config.json

### Mensajes de Error
- `"Archivo vacío o inválido"` - Archivo sin contenido
- `"Carácter inválido '{char}' en posición {pos}"` - Celda malformada
- `"Fila {n}: longitud diferente"` - Inconsistencia de columnas
- `"Dimensión {size} fuera de rango [15-30]"` - Tamaño inválido

## Integración con Otros Sistemas

### CityCreationRenderer
- Botón "📁 Seleccionar archivo .txt"
- Display de validación con estadísticas
- Auto-fill button para recursos

### CityCreationController
- Usa mapLayout en formData
- Calcula recursos automáticamente
- Guarda layout en localStorage

### CityBuilderInitializer
- Detecta layout guardado
- Convierte a formato correcto
- Pasa a MapRenderer

### MapRenderer
- Ya soporta layouts string[][]
- Crea Building objects automáticamente
- Renderiza edificios en el mapa

## Recursos Calculados

El sistema suma automáticamente los recursos de cada edificio:

| Tipo | Subtipo | Energía | Agua | Alimento |
|------|---------|---------|------|----------|
| U1 | Power Plant | 200 | 0 | 0 |
| U2 | Water Plant | 0 | 150 | 0 |
| I2 | Farm | 0 | 0 | 50 |

**Nota:** Los valores se toman de config.json, sección "builds".

## Ejemplo de Uso

1. Crear ciudad normalmente
2. En el formulario, ver sección "Cargar Mapa desde Archivo"
3. Clickear "📁 Seleccionar archivo .txt"
4. Seleccionar un archivo .txt con formato válido
5. Verá: "✅ Mapa cargado correctamente | Tamaño: 15x15 | Terreno: 195 | Caminos: 10 | Edificios: 7"
6. Opcionalmente, clickear "🎯 Auto-Llenar" para calcular recursos
7. Completar nombre de ciudad, alcalde, región
8. Clickear "Crear Ciudad"

El mapa será renderizado automáticamente con todos los edificios cargados.

## Testing

Incluido: `example_map.txt` para pruebas rápidas.

Pruebas recomendadas:
1. Cargar ejemplo_map.txt - Mapa 15x15 con edificios variados
2. Crear mapa 30x30 con configuración máxima
3. Intentar cargar archivo inválido y verificar mensajes de error
4. Verificar que recursos se calculan correctamente
5. Cargar ciudad y verificar edificios aparecen en el mapa

## Limitaciones Conocidas

- Los edificios cargados no tienen estado (edad, dinero, etc.) - usan valores por defecto
- No se cargan ciudadanos preexistentes (siempre inician en 0)
- Edificios no persisten su historia de cambios
