# habitá - Frontend Inmobiliario (Medellín)

Prototipo frontend para la plataforma inmobiliaria **habitá**, enfocado en la búsqueda de inmuebles, comparación de ofertas de portales y estimación de precios para arrendatarios y propietarios en Medellín.

## Tecnologías

- **React 19**
- **TypeScript 5.7**
- **Vite 8**
- **Tailwind CSS v4** (con `@tailwindcss/vite`)

## Estructura del Proyecto

```
Frotend/
├── index.html            # Punto de entrada HTML limpio
├── package.json          # Dependencias y scripts del proyecto
├── tsconfig.json         # Configuración de TypeScript
├── vite.config.ts        # Configuración de Vite y Tailwind v4
└── src/
    ├── main.tsx          # Montaje de React
    ├── App.tsx           # Enrutamiento y control de vistas
    ├── types.ts          # Tipos e interfaces (Property, Page, etc.)
    ├── index.css         # Importación de Tailwind CSS y fuentes
    └── pages/
        ├── Landing.tsx         # Página principal / Landing page
        ├── Arrendatario.tsx    # Búsqueda y filtros de inmuebles
        ├── Propietario.tsx     # Análisis y estimación de precios
        ├── AdminLogin.tsx      # Acceso al panel de administración
        └── AdminDashboard.tsx  # Dashboard con métricas y gestión
```

## Ejecución Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:5173/](http://localhost:5173/).

### 3. Compilar para producción
```bash
npm run build
```

### 4. Previsualizar compilación
```bash
npm run preview
```
