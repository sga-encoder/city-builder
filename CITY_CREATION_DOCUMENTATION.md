# 📋 Sistema de Creación de Ciudad - Documentación

## Descripción General

El **Sistema de Creación de Ciudad** es un formulario inicial que aparece cuando un jugador abre la aplicación por primera vez. Permite al jugador ingresar los datos básicos de su ciudad y los datos del alcalde/jugador.

## Flujo de Funcionamiento

### 1. **Verificación de Ciudad Guardada** 
   - **Archivo**: `domain/main.js`
   - **Lógica**: Al iniciar la aplicación, se verifica si existe una ciudad guardada en localStorage
   - **Resultado**:
     - Si existe: Se carga la ciudad guardada
     - Si NO existe: Se muestra el formulario de creación

### 2. **Renderizado del Formulario**
   - **Archivo**: `domain/components/cityCreation/Renderer.js`
   - **Contenedor**: Se crea un overlay con el formulario dentro
   - **Estilos**: `view/css/components/cityCreation.css`

### 3. **Recolección de Datos**
   - El formulario valida todos los campos
   - Se recopilan los siguientes datos:
     - Nombre de la ciudad (máx. 50 caracteres)
     - Nombre del alcalde/jugador (máx. 50 caracteres)
     - Región geográfica (lista de ciudades predefinidas o coordenadas personalizadas)
     - Tamaño del mapa (15x15 a 30x30)

### 4. **Guardado en LocalStorage**
   - **Archivo**: `domain/controllers/cityCreation/Controller.js`
   - **Datos Guardados**:
     - `cityConfig`: Configuración principal de la ciudad
     - `resources`: Recursos iniciales
     - `map`: Mapa (inicialmente vacío)
     - `turn`: Turno (0)
     - `citizens`: Ciudadanos (inicialmente vacío)
     - `score`: Puntuación (0)

### 5. **Inicialización del Juego**
   - **Archivo**: `domain/services/cityBuilder/Initializer.js`
   - El mapa se crea con el tamaño especificado
   - Los recursos se cargan desde localStorage
   - Se inicializa el sistema de turnos

## Criterios de Aceptación - COMPLETADOS ✅

- [x] **Formulario con campos obligatorios**
  - Nombre de la ciudad (máx. 50 caracteres)
  - Nombre del alcalde/jugador (máx. 50 caracteres)
  - Región geográfica (con opciones predefinidas y personalizadas)
  - Tamaño del mapa (selector 15x15 a 30x30)

- [x] **Validación de campos**
  - Todos los campos son obligatorios
  - Se valida la longitud máxima (50 caracteres)
  - Se valida el rango del tamaño del mapa (15-30)
  - Se muestra mensajes de error si la validación falla

- [x] **Creación de ciudad con recursos iniciales**
  - Dinero: $50,000
  - Electricidad: 0 (debe construir plantas)
  - Agua: 0 (debe construir plantas)
  - Población: 0

- [x] **Redirección automática a vista principal**
  - Al confirmar, se destruye el formulario
  - Se inicializa el juego automáticamente

- [x] **Guardado en LocalStorage**
  - Configuración de ciudad
  - Recursos iniciales
  - Mapa vacío
  - Turno inicial
  - Ciudadanos
  - Puntuación

## Regiones Geográficas Predefinidas

El formulario incluye las siguientes ciudades de Colombia:

1. **Bogotá** - 4.7110°N, 74.0055°O
2. **Medellín** - 6.2442°N, 75.5898°O
3. **Cali** - 3.4372°N, 76.5196°O
4. **Barranquilla** - 10.9639°N, 74.7964°O
5. **Cartagena** - 10.3910°N, 75.5139°O
6. **Santa Marta** - 11.2401°N, 74.2273°O
7. **Cúcuta** - 7.8854°N, 72.5078°O
8. **Especificar Coordenadas** - Opción para ingresar latitud y longitud personalizadas

## Archivos Creados

### 1. Componente del Formulario
- **Ruta**: `domain/components/cityCreation/Renderer.js`
- **Responsabilidades**:
  - Crear la interfaz del formulario
  - Manejar la entrada del usuario
  - Validar datos
  - Mostrar mensajes de error/éxito

### 2. Controlador del Formulario
- **Ruta**: `domain/controllers/cityCreation/Controller.js`
- **Responsabilidades**:
  - Orquestar la creación de ciudad
  - Guardar datos en localStorage
  - Verificar ciudades guardadas
  - Limpiar ciudades guardadas

### 3. Estilos del Formulario
- **Ruta**: `view/css/components/cityCreation.css`
- **Características**:
  - Diseño responsivo
  - Animaciones smooth
  - Validación visual
  - Gradientes y efectos modernos

## Archivos Modificados

### 1. index.html
- Agregó enlace a `view/css/components/cityCreation.css`

### 2. domain/main.js
- Agregó lógica de verificación de ciudad guardada
- Muestra formulario si no existe ciudad
- Inicia juego automáticamente después de crear ciudad

### 3. domain/services/cityBuilder/Initializer.js
- Agregó método `getMapSize()` para cargar tamaño de mapa from localStorage
- Actualiza `buildCity()` para usar el tamaño de mapa guardado

### 4. domain/services/cityBuilder/phases/CityPhase.js
- Agregó método `loadCityConfig()` para cargar configuración from localStorage
- Actualiza `createCity()` para usar datos guardados

## Métodos Públicos del Controlador

### CityCreationController

```javascript
// Mostrar formulario
new CityCreationController().show(onCityCreatedCallback);

// Verificar si existe ciudad guardada
CityCreationController.hasSavedCity() // boolean

// Cargar ciudad guardada
CityCreationController.loadSavedCity() // object | null

// Limpiar ciudad guardada
CityCreationController.clearSavedCity() // boolean
```

## Métodos Públicos del Renderer

```javascript
// Renderizar formulario
renderer.render(onSubmitCallback);

// Mostrar error
renderer.showError(message);

// Mostrar éxito
renderer.showSuccess(message);

// Deshabilitar formulario durante envío
renderer.disableForm(disabled);

// Destruir formulario
renderer.destroy();

// Obtener datos del formulario
renderer.getFormData(); // { cityName, mayorName, region, mapSize }

// Validar datos
renderer.validateFormData(data); // { valid, message }
```

## Flujo Técnico Detallado

### 1. Inicio de la Aplicación

main.js ejecuta:
  ├─ CityCreationController.hasSavedCity()
  │  ├─ Si existe: Continúa con buildCity()
  │  └─ Si NO existe: Muestra formulario
  └─ new CityCreationController().show()


### 2. Creación de Ciudad

formulario.handleSubmit():
  ├─ Valida datos
  ├─ Crea objeto cityData
  ├─ Guarda en localStorage:
  │  ├─ cityConfig
  │  ├─ resources
  │  ├─ map
  │  ├─ turn
  │  ├─ citizens
  │  └─ score
  ├─ Destruye formulario
  └─ Llama CityBuilderInitializer.buildCity()


### 3. Carga del Juego

CityBuilderInitializer.buildCity():
  ├─ Carga datos guardados
  ├─ Carga tamaño de mapa
  ├─ Ejecuta ConfigPhase
  ├─ Ejecuta AssetsPhase
  ├─ Ejecuta MapPhase (con tamaño correcto)
  ├─ Ejecuta CityPhase (carga datos de ciudad)
  └─ Ejecuta UIPhase


## LocalStorage - Estructura de Datos

### cityConfig
```json
{
  "id": "city_1712234567890",
  "name": "Mi Ciudad",
  "mayor": {
    "name": "Juan Pérez",
    "joinDate": "2024-04-04T10:30:00.000Z"
  },
  "location": {
    "name": "Bogotá",
    "latitude": 4.7110,
    "longitude": -74.0055
  },
  "mapSize": 20,
  "createdAt": "2024-04-04T10:30:00.000Z",
  "updatedAt": "2024-04-04T10:30:00.000Z",
  "turn": 0
}
```

### resources
```json
{
  "money": 50000,
  "energy": 0,
  "water": 0,
  "food": 0
}
```

### map
```json
[]
```

### turn
```json
0
```

### citizens
```json
[]
```

### score
```json
0
```

## Casos de Uso

### Caso 1: Primer Acceso
1. Usuario abre la aplicación
2. No hay ciudad guardada → Formulario se muestra
3. Usuario completa el formulario
4. Ciudad se crea y se inicia el juego

### Caso 2: Acceso Posterior
1. Usuario abre la aplicación
2. Existe ciudad guardada → Se carga directamente
3. Juego continúa desde donde se quedó

### Caso 3: Nueva Ciudad (Borrar Guardado)
1. Usuario (o admin) llama `CityCreationController.clearSavedCity()`
2. Todo localStorage se limpia
3. En próximo acceso, aparecerá formulario nuevamente

## Validaciones Implementadas

| Campo | Validación |
|-------|-----------|
| Nombre Ciudad | Obligatorio, máx. 50 caracteres, no vacío |
| Nombre Alcalde | Obligatorio, máx. 50 caracteres, no vacío |
| Región | Se debe seleccionar una región o coordenadas |
| Coordenadas | Si se especifican, deben estar en rango válido (-90 a 90 lat, -180 a 180 lon) |
| Tamaño Mapa | Obligatorio, debe estar entre 15 y 30 |

## Mensajes de Error UI

- "El nombre de la ciudad es obligatorio"
- "El nombre de la ciudad no puede exceder 50 caracteres"
- "El nombre del alcalde es obligatorio"
- "El nombre del alcalde no puede exceder 50 caracteres"
- "Debe seleccionar una región"
- "El tamaño del mapa debe estar entre 15 y 30"

## Características de la UI

- **Overlay oscuro** con efecto blur
- **Animación de entrada** suave (slide up + fade)
- **Contador de caracteres** en tiempo real
- **Campos con validación** visual en tiempo real
- **Botón de envío** con efectos hover
- **Mensajes de error/éxito** con animaciones
- **Diseño responsivo** para mobile, tablet y desktop
- **Accesibilidad** con labels asociados a inputs

## Testing Manual

Para verificar el funcionamiento:

1. **Abrir en navegador fresco**
   - Limpiar localStorage
   - Abrir aplicación
   - Verificar que aparece el formulario

2. **Completar Formulario**
   - Ingresar datos válidos
   - Verificar validaciones
   - Confirmar crear ciudad

3. **Verificar LocalStorage**
   - DevTools → Application → LocalStorage
   - Verificar que todos los datos están guardados

4. **Verifier Recarga**
   - Recargar página
   - Verificar que se carga la ciudad (no el formulario)

5. **Probar Coordenadas Personalizadas**
   - Seleccionar "Especificar Coordenadas"
   - Ingresar lat/lon
   - Verificar funcionamiento

## Notas de Desarrollo

- La clase `LocalStorage` espera strings, por eso se usa `JSON.stringify()` y `JSON.parse()`
- El ID de ciudad se genera con timestamp (`city_${Date.now()}`)
- Las regiones predefinidas se pueden extender fácilmente editando el array `cities` en Renderer.js
- El tamaño del mapa se utiliza tanto en la creación inicial como en futuras recargas
- Todos los logs usan el Logger centralizado para debugging

## Futuras Mejoras

- [ ] Selección de dificultad (afecta recursos iniciales)
- [ ] Tutorial/Onboarding
- [ ] Importar ciudad (cargar archivo)
- [ ] Multiplayer/Servidor
- [ ] Temas personalizables
- [ ] Validación de nombres únicos
