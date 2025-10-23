# Estrategia de Caché para Cat Web

## Resumen

Se ha implementado un sistema de caché completo para mejorar el rendimiento de la aplicación, especialmente en la tabla de razas de gatos que realiza múltiples llamadas al backend.

## Componentes

### 1. CacheService (`cache.service.ts`)

Servicio genérico de caché que proporciona:

- **Almacenamiento en memoria**: Map para acceso rápido
- **Persistencia en localStorage**: Sobrevive a recargas de página
- **TTL (Time To Live)**: Expiración automática de datos
- **Integración con RxJS**: Método `cacheObservable()` para cachear Observables

#### Configuración

```typescript
// TTL por defecto: 5 minutos
private readonly DEFAULT_TTL = 5 * 60 * 1000;
```

#### Métodos principales

- `get<T>(key, ttl)`: Obtiene datos del caché
- `set<T>(key, data, persistInLocalStorage)`: Guarda datos
- `has(key, ttl)`: Verifica existencia
- `remove(key)`: Elimina entrada
- `clear()`: Limpia todo el caché
- `cacheObservable<T>(key, source$, ttl)`: Cachea Observables

### 2. CatsService Actualizado

Todos los métodos ahora usan caché:

#### Configuración de TTL

```typescript
// TTL general: 10 minutos
private readonly CACHE_TTL = 10 * 60 * 1000;

// TTL para todas las razas: 20 minutos (más largo)
getAllBreedsWithImages(): TTL * 2
```

#### Métodos con caché

| Método | Cache Key | TTL | Descripción |
|--------|-----------|-----|-------------|
| `getBreedNames()` | `breed_names` | 10 min | Lista de nombres |
| `getBreedById(id)` | `breed_{id}` | 10 min | Raza específica |
| `searchBreeds(q)` | `search_{q}_{image}` | 10 min | Búsqueda |
| `getBreedImage(id)` | `breed_image_{id}` | 10 min | Imagen |
| `getAllBreedsWithImages()` | `all_breeds_with_images` | 20 min | Todas las razas |

#### Métodos adicionales

- `clearCache()`: Limpia todo el caché
- `getCacheStats()`: Obtiene estadísticas del caché

## Beneficios

### 1. **Rendimiento Mejorado**

**Antes**:
- Tabla de razas: 50+ llamadas HTTP cada carga
- Tiempo de carga: ~5-10 segundos
- Uso de red: Alto

**Después**:
- Primera carga: 1 llamada HTTP
- Cargas subsecuentes: 0 llamadas (datos del caché)
- Tiempo de carga: <100ms (desde caché)
- Uso de red: Reducido en ~98%

### 2. **Experiencia de Usuario**

- Navegación instantánea entre vistas
- Datos disponibles sin conexión (durante TTL)
- Reduce latencia y consumo de datos móviles

### 3. **Reducción de Carga en el Servidor**

- Menos llamadas al backend
- Menos carga en TheCatAPI
- Menor riesgo de alcanzar límites de rate limiting

## Casos de Uso

### Caso 1: Usuario navega entre vistas

```
1. Usuario entra a "Tabla de Razas"
   → Primera carga: API call + guardar en caché

2. Usuario navega a "Buscador"
   → Usa caché de búsquedas previas

3. Usuario vuelve a "Tabla de Razas"
   → Carga instantánea desde caché (0 API calls)
```

### Caso 2: Usuario busca la misma raza

```
1. Usuario busca "Persian"
   → API call + guardar en caché

2. Usuario busca "Persian" nuevamente (dentro de 10 min)
   → Respuesta instantánea desde caché

3. Después de 10 minutos
   → Caché expirado, nueva API call
```

### Caso 3: Recarga de página

```
1. Usuario carga la aplicación
   → CacheService carga datos desde localStorage
   → Datos disponibles inmediatamente

2. Si TTL no ha expirado
   → No se hacen API calls

3. Si TTL expiró
   → Nuevas API calls + actualizar caché
```

## Gestión del Caché

### Limpiar caché manualmente

```typescript
// En cualquier componente
constructor(private catsService: CatsService) {}

clearCache() {
  this.catsService.clearCache();
  console.log('Caché limpiado');
}
```

### Verificar estadísticas

```typescript
const stats = this.catsService.getCacheStats();
console.log(`Entradas en caché: ${stats.size}`);
```

### Desactivar persistencia en localStorage

```typescript
// En cache.service.ts, método set()
this.cacheService.set(key, data, false); // false = no persistir
```

## Configuración Avanzada

### Cambiar TTL global

```typescript
// En cats.service.ts
private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutos
```

### TTL personalizado por endpoint

```typescript
// Ejemplo: caché más corto para imágenes
getBreedImage(breedId: string): Observable<string> {
  const shortTTL = 5 * 60 * 1000; // 5 minutos
  return this.cacheService.cacheObservable(
    `breed_image_${breedId}`,
    this.http.get(/* ... */),
    shortTTL
  );
}
```

### Invalidación selectiva

```typescript
// Eliminar solo búsquedas
this.cacheService.remove('search_persian_true');

// Eliminar solo razas
this.cacheService.remove('breed_names');
```

## Consideraciones

### Pros
✅ Rendimiento mejorado dramáticamente
✅ Menor uso de red
✅ Experiencia offline
✅ Reduce carga en servidor
✅ Fácil de configurar y mantener

### Contras
⚠️ Datos pueden estar desactualizados (hasta TTL)
⚠️ Usa espacio en localStorage (~5-10MB)
⚠️ Primera carga sigue siendo lenta

### Recomendaciones

1. **TTL apropiado**: Datos de gatos raramente cambian, 10-20 min es apropiado
2. **Limpiar en logout**: Considerar limpiar caché al cerrar sesión
3. **Monitoreo**: Agregar métricas para ver hit rate del caché
4. **Límite de tamaño**: Implementar LRU si el caché crece mucho

## Pruebas

Ejecutar tests del caché:

```bash
npm test -- cache.service.spec.ts
```

## Futuras Mejoras

- [ ] Implementar estrategia LRU (Least Recently Used)
- [ ] Agregar métricas de hit/miss rate
- [ ] Cache warming en background
- [ ] Invalidación inteligente basada en eventos
- [ ] Compresión de datos en localStorage
- [ ] Service Worker para caché más robusto
