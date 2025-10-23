# Cat Web - Frontend Angular 17

Aplicación frontend desarrollada con Angular 17 para explorar razas de gatos, consumiendo datos de The Cat API a través del backend Node.js.

## 🚀 Características

### Vista 1: Explorador de Razas
- **Lista desplegable** con todas las razas de gatos disponibles
- **Carrusel de imágenes** de la raza seleccionada
- **Información detallada** de la raza:
  - Descripción
  - Temperamento
  - Esperanza de vida
  - Peso
  - Niveles de características (afecto, energía, inteligencia, etc.)
  - Enlace a Wikipedia

### Vista 2: Tabla de Razas
- **Tabla completa** con datos relevantes de todas las razas
- **Búsqueda en tiempo real** por nombre, origen o temperamento
- **Ordenamiento** por columnas (nombre, origen, niveles de características)
- **Imágenes en miniatura** de cada raza
- **Indicadores visuales** de niveles de características

## 📋 Requisitos

- Node.js v14 o superior
- Angular CLI v17
- Backend corriendo en `http://localhost:3000`

## 🛠️ Instalación

```bash
# Navegar al directorio del frontend
cd frontend/cat-web

# Instalar dependencias
npm install
```

## 🚀 Ejecución

### Modo Desarrollo

```bash
npm start
# o
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

### Modo Producción

```bash
# Construir para producción
npm run build
# o
ng build

# Los archivos se generarán en dist/cat-web
```

## 📁 Estructura del Proyecto

```
cat-web/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── breed-selector/     # Vista del explorador con dropdown
│   │   │   └── breed-table/        # Vista de tabla
│   │   ├── models/
│   │   │   └── breed.model.ts      # Interfaces de datos
│   │   ├── services/
│   │   │   └── cats.service.ts     # Servicio HTTP
│   │   ├── app.component.ts        # Componente raíz
│   │   ├── app.routes.ts           # Configuración de rutas
│   │   └── app.config.ts           # Configuración de la app
│   └── styles.css                  # Estilos globales
└── package.json
```

## 🎯 Funcionalidades

### Explorador de Razas (/breeds)
1. Seleccionar una raza del dropdown
2. Ver carrusel con imágenes de la raza
3. Navegar entre imágenes con controles
4. Ver información completa: descripción, temperamento, características
5. Enlace a Wikipedia para más información

### Tabla de Razas (/table)
1. Ver todas las razas en formato tabla
2. Buscar por nombre, origen o temperamento
3. Ordenar por cualquier columna
4. Ver niveles de características con indicadores visuales
5. Ver miniaturas de cada raza

## 🔌 Conexión con Backend

El frontend consume los siguientes endpoints del backend:

- `GET /breeds` - Lista de nombres de razas
- `GET /breeds/:breedId` - Información de una raza
- `GET /breeds/search?q=term` - Búsqueda de razas
- `GET /imagesByBreedId/:breedId` - Imagen de una raza

## 🎨 Diseño

- Diseño moderno y limpio
- Completamente responsive
- Navegación intuitiva
- Transiciones suaves
- Carrusel interactivo
- Visualización clara de datos

## 🚦 Routing

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | BreedSelectorComponent | Redirecciona a /breeds |
| `/breeds` | BreedSelectorComponent | Explorador de razas |
| `/table` | BreedTableComponent | Tabla de razas |

## 🐛 Solución de Problemas

### No conecta al backend
Verificar que el backend esté corriendo en `http://localhost:3000`

### Imágenes no cargan
1. Verificar conexión a internet
2. Verificar API key del backend

### Error CORS
El backend ya tiene CORS habilitado, verificar configuración

## 📝 Tecnologías

- Angular 17 (Standalone Components)
- TypeScript
- RxJS
- HttpClient
- CSS3

## 👥 Autor

Prueba Técnica - FullStack Node 2025

## 📄 Licencia

ISC
