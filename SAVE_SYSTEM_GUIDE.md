# 💾 Sistema de Guardado - Guía Completa

## Resumen de Cambios

Se ha implementado un **sistema de guardado centralizado, robusto y sincronizado** que elimina la pérdida de datos. El nuevo sistema guarda el estado completo del juego de forma atómica.

### ¿Qué cambió?

**ANTES:** 
- Múltiples claves en localStorage desincronizadas
- Auto-guardado cada 30 segundos (insuficiente)
- Sin guardado al construir o terminar turno
- Sin protección al cerrar la página

**AHORA:**
- Una sola clave unificada: `gameState`
- Auto-guardado cada 20 segundos
- Guardado automático después de cada turno ✓
- Guardado automático después de cada construcción ✓
- Guardado automático al cerrar la página ✓
- Indicador visual de guardado

---

## Flujo de Guardado Automático

```
┌─────────────────────────────────────────────────────────┐
│                  MOMENTOS DE GUARDADO                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. PERIÓDICO (Auto-Save)                              │
│     └─ Cada 20 segundos                                │
│     └─ SaveManager.quickSave()                        │
│                                                          │
│  2. DESPUÉS DE TURNO COMPLETADO                        │
│     └─ TurnSystem.executeNextTurn() termina            │
│     └─ SaveManager.saveGame()                          │
│     └─ Mostrando indicador visual                       │
│                                                          │
│  3. DESPUÉS DE CONSTRUIR                               │
│     └─ BuildController.buyBuildingCell()               │
│     └─ BuildController.buyBuildingCellsBatch()        │
│     └─ SaveManager.saveGame()                          │
│     └─ Toast de confirmación                            │
│                                                          │
│  4. ANTES DE CERRAR                                     │
│     └─ beforeunload event                              │
│     └─ pagehide event                                  │
│     └─ SaveManager.quickSave()                        │
│                                                          │
│  5. MANUAL (Usuario)                                    │
│     └─ SaveControls "Guardar juego"                   │
│     └─ SaveManager.saveGame()                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Estructura del gameState

```javascript
{
  "grid": [
    ["g", "h0", "c0"],    // Mapa (g=grass, h=house, c=commerce, etc)
    ["r", "h1", "i0"],    // r=road, i=industry
    ...
  ],
  
  "citizens": [
    {
      "id": 1,
      "name": "John",
      "happiness": 85,
      "hasJob": true,
      "hasHome": true,
      "home": {"type": "h", "subtype": 0},
      "job": {"type": "i", "subtype": 0}
    },
    ...
  ],
  
  "resources": {
    "money": 45000,       // Dinero disponible
    "energy": 95,         // % de energía
    "water": 88,          // % de agua
    "food": 92            // % de comida
  },
  
  "cityConfig": {
    "id": 1,
    "name": "Mi Ciudad",
    "mayor": {...},
    "location": {...},
    "createdAt": "2024-..."
  },
  
  "turn": 15,             // Turno actual
  "score": 5000,          // Puntuación acumulada
  "timestamp": "2024-..."  // Cuándo se guardó
}
```

---

## Cómo Funciona

### Inicialización
```javascript
CityPhase.execute() 
  → loadGameState()           // Intenta cargar estado guardado
  → createCity()              // Crea instancia de City
  → initTurnSystem()          // Inicializa sistema de turnos
  → SaveManager.init()        // Inicia auto-guardado
```

### Al Ejecutar Turno
```javascript
TurnSystem.executeNextTurn()
  → Valida estado
  → Ejecuta fases del turno
  → Actualiza ciudadanos, recursos, score
  → SaveManager.saveGame()    // ✨ GUARDADO AUTOMÁTICO
```

### Al Construir
```javascript
BuildController.buyBuildingCell()
  → Valida colocación
  → Descuenta recursos
  → Coloca edificio en grid
  → SaveManager.saveGame()    // ✨ GUARDADO AUTOMÁTICO
```

### Al Cerrar Juego
```javascript
window.beforeunload event
  → SaveManager.quickSave()   // ✨ GUARDADO SILENCIOSO
  → Cierra navegador
```

### Al Cargar Juego
```javascript
CityPhase.loadGameState()
  → Lee "gameState" de localStorage
  → Valida que sea completo
  → Si falla: intenta cargar desde keys antiguas (fallback)
  → Restaura grid, ciudadanos, recursos, turno, score
```

---

## ¿Qué Pasa si Cierro el Juego a Mitad de Partida?

✅ **Se guarda el estado actual**
- UIPhase configura handlers de `beforeunload`/`pagehide`
- Cuando intentas cerrar la pestaña:
  1. Se dispara el evento `beforeunload`
  2. SaveManager.quickSave() guarda el estado actual
  3. Se cierra la pestaña
- Cuando reabres: ¡El juego se restaura exactamente donde estaba!

---

## Garantías de Integridad

### ✅ Atomicidad
- Todo el estado se guarda **junto** (grid + ciudadanos + recursos + turno + score)
- Nunca guardado parcial que cause inconsistencias

### ✅ Frecuencia
- Auto-guardado cada 20 segundos
- Eventos críticos (turno, construcción) también generan guardar
- Antes de cerrar: guardado de emergencia

### ✅ Compatibilidad
- Si existe `gameState`: carga desde ahí
- Si no: intenta cargar desde sistema antiguo
- Migrará automáticamente a nuevo formato

### ✅ Validación
- Se valida que el estado sea completo antes de restaurar
- Si falta algo: usa defaults seguros

---

## Debugging

### Ver Estado Guardado en Consola
```javascript
const saved = JSON.parse(localStorage.getItem('gameState'))
console.log(saved)
```

### Borrar Guardado Manual
```javascript
localStorage.removeItem('gameState')
location.reload()  // Crear nueva partida
```

### Test Manual
En la consola del navegador:
```javascript
import { testSaveManager } from './domain/services/cityBuilder/managers/SaveManager.test.js'
testSaveManager()
```

---

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| **SaveManager.js** | Reescrito: guardado centralizado, intervalos reducidos |
| **CityPhase.js** | Carga estado unificado, fallback a sistema antiguo |
| **TurnSystem.js** | Guarda después de turno completado |
| **BuildController.js** | Guarda después de construir |
| **UIPhase.js** | Configura handlers de guardado al cerrar |

---

## Indicador Visual

- **Cuando se guarda:** Aparece "💾 Guardando..." en esquina inferior derecha
- **Duración:** 1 segundo (auto-desaparece)
- **Solo para:** saveGame() (no aparece en auto-saves silenciosos)

---

## Resumen de Seguridad

| Escenario | Antes | Ahora |
|-----------|-------|--------|
| Usuario cierra sin guardar | ❌ Pierde progreso | ✅ Se guarda automáticamente |
| Auto-guardado cada 30s | Riesgo 30s sin guardar | ✅ Riesgo 20s + eventos |
| Construcción | No se guardaba | ✅ Se guarda inmediatamente |
| Turno completado | No se guardaba | ✅ Se guarda inmediatamente |
| Datos desincronizados | ❌ Posible | ✅ Imposible (una sola clave) |

---

## ¿Cómo Probar?

### Test 1: Auto-guardado periódico
1. Abre el juego
2. Deja pasar 20 segundos sin hacer nada
3. Abre DevTools → Application → localStorage
4. Verifica que `gameState` tenga timestamp reciente

### Test 2: Guardado en construcción
1. Construye un edificio
2. Abre DevTools → Application → localStorage
3. Lee `gameState` y verifica que el edificio esté en `grid`

### Test 3: Guardado en turno
1. Completa un turno
2. Abre DevTools y verifica timestamp de `gameState`
3. Verifica que `turn` incrementó

### Test 4: Restauración
1. Juega durante 5 minutos
2. Cierra el navegador completamente
3. Reabre el juego
4. ¡Debe estar en el mismo estado!

---

## Preguntas Frecuentes

**P: ¿Qué pasa con las guardados antiguas?**
A: Se cargan automáticamente. Si existe formato antiguo, se migra a `gameState`.

**P: ¿Puedo borrar el guardado?**
A: Sí, en el menú principal hay botón "Borrar guardado".

**P: ¿Se guarda en la nube?**
A: No, solo en localStorage del navegador (como antes).

**P: ¿Cuáles son los límites?**
A: localStorage ~5-10MB, sufficient para muchas ciudades.

**P: ¿Se pierde si borro cookies?**
A: Sí, localStorage se borra con cookies. No hay forma de evitarlo sin backend.
