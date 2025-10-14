# 🌀 Fractal Explorer# React + TypeScript + Vite



**Explorador Interactivo de Fractales en la Web**This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



Una aplicación web interactiva construida con React, TypeScript y Canvas API que te permite explorar y manipular fractales matemáticos en tiempo real.Currently, two official plugins are available:



## ✨ Características- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### 🎨 Fractales Implementados

- **Conjunto de Mandelbrot**: El fractal más icónico, con su característica forma de cardioide## React Compiler

- **Conjunto de Julia**: Variaciones infinitas basadas en diferentes parámetros complejos

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

### 🖱️ Controles Interactivos

- **Zoom**: Haz clic para acercarte y explorar los detalles infinitos del fractal## Expanding the ESLint configuration

- **Navegación**: Arrastra para moverte por diferentes áreas del fractal

- **Parámetros ajustables**:If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

  - Número máximo de iteraciones (controla el nivel de detalle)

  - Parámetros C (para el conjunto de Julia)```js

  - Paletas de colores personalizablesexport default defineConfig([

  - Velocidad de renderizado  globalIgnores(['dist']),

  {

### 🎨 Personalización Visual    files: ['**/*.{ts,tsx}'],

- Múltiples esquemas de colores predefinidos    extends: [

- Paleta de colores personalizable      // Other configs...

- Ajuste de brillo y contraste

- Exportación de imágenes en alta resolución      // Remove tseslint.configs.recommended and replace with this

      tseslint.configs.recommendedTypeChecked,

### ⚡ Rendimiento Optimizado      // Alternatively, use this for stricter rules

- Renderizado eficiente usando Canvas API      tseslint.configs.strictTypeChecked,

- Cálculos optimizados para navegadores modernos      // Optionally, add this for stylistic rules

- Responsive design para diferentes tamaños de pantalla      tseslint.configs.stylisticTypeChecked,



## 🚀 Inicio Rápido      // Other configs...

    ],

### Prerrequisitos    languageOptions: {

- Node.js (versión 16 o superior)      parserOptions: {

- npm o yarn        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

### Instalación      },

      // other options...

1. Clona el repositorio:    },

```bash  },

git clone <tu-repositorio>])

cd FractalExplorer```

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

2. Instala las dependencias:

```bash```js

npm install// eslint.config.js

```import reactX from 'eslint-plugin-react-x'

import reactDom from 'eslint-plugin-react-dom'

3. Inicia el servidor de desarrollo:

```bashexport default defineConfig([

npm run dev  globalIgnores(['dist']),

```  {

    files: ['**/*.{ts,tsx}'],

4. Abre tu navegador en `http://localhost:5173`    extends: [

      // Other configs...

## 🎮 Cómo Usar      // Enable lint rules for React

      reactX.configs['recommended-typescript'],

### Navegación Básica      // Enable lint rules for React DOM

1. **Zoom In**: Haz clic en cualquier punto del fractal      reactDom.configs.recommended,

2. **Zoom Out**: Haz clic derecho o usa el botón "Reset"    ],

3. **Mover**: Arrastra el fractal con el mouse    languageOptions: {

4. **Reset**: Vuelve a la vista inicial      parserOptions: {

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

### Panel de Control        tsconfigRootDir: import.meta.dirname,

- **Tipo de Fractal**: Alterna entre Mandelbrot y Julia      },

- **Iteraciones**: Aumenta para más detalle (más lento) o disminuye para más velocidad      // other options...

- **Paleta de Colores**: Selecciona diferentes esquemas de colores    },

- **Parámetros Julia**: Ajusta los valores de C real e imaginario (solo para Julia)  },

])

### Atajos de Teclado```

- `R`: Reset a vista inicial
- `+`: Aumentar iteraciones
- `-`: Disminuir iteraciones
- `C`: Cambiar paleta de colores
- `S`: Guardar imagen

## 🛠️ Tecnologías

- **React 19**: Framework de UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **Canvas API**: Renderizado de gráficos
- **CSS3**: Estilos y animaciones

## 📐 Conceptos Matemáticos

### Conjunto de Mandelbrot
Para cada punto `c` en el plano complejo, iteramos la fórmula:

$$z_{n+1} = z_n^2 + c$$

Comenzando con $z_0 = 0$. Si la secuencia no diverge (permanece acotada), el punto pertenece al conjunto.

### Conjunto de Julia
Similar al Mandelbrot, pero `c` es constante y $z_0$ varía:

$$z_{n+1} = z_n^2 + c$$

Cada valor de `c` produce un conjunto de Julia diferente.

## 🎨 Paletas de Colores

El color de cada píxel se determina por el número de iteraciones antes de que el valor escape:
- **Colores cálidos**: Rojo, naranja, amarillo
- **Colores fríos**: Azul, cian, púrpura
- **Escala de grises**: Para visualización clásica
- **Arcoíris**: Espectro completo de colores

## 📦 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run preview  # Previsualiza la build de producción
npm run lint     # Ejecuta el linter
```

## 🔧 Configuración

El proyecto usa:
- **Vite** para bundling y HMR
- **TypeScript** para type safety
- **ESLint** para linting
- **SWC** para compilación rápida de React

## 📈 Roadmap Futuro

- [ ] Más tipos de fractales (Burning Ship, Newton, Tricorn)
- [ ] Web Workers para cálculos en segundo plano
- [ ] WebGL para renderizado acelerado por GPU
- [ ] Animaciones de zoom suaves
- [ ] Compartir configuraciones mediante URL
- [ ] Historial de navegación (deshacer/rehacer)
- [ ] Modo de grabación de video

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**DaniVegaM**

---

**¡Explora el infinito! 🌀✨**
