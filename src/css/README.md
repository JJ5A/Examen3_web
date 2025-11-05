# Organización CSS

Este directorio contiene todos los archivos CSS del proyecto organizados de manera modular.

## Estructura

```
src/css/
├── global.css    # Estilos globales, reset y base
├── index.css     # Archivo principal que importa todos los estilos
├── login.css     # Estilos específicos del componente Login
└── demo.css      # Estilos de la página de demostración
```

## Archivos

### `global.css`
- Reset CSS básico
- Estilos base para elementos HTML
- Utilidades de accesibilidad
- Variables CSS (si se usan)

### `login.css`
- Estilos específicos del componente Login
- Formularios, botones, inputs
- Estados de loading y error
- Responsive design para el login

### `demo.css`
- Estilos para la página de demostración
- Layout del contenido informativo
- Estilos para código y ejemplos
- Responsive design para la demo

### `index.css`
- Archivo principal que importa todos los CSS
- Útil para importar todos los estilos desde un solo lugar

## Uso

### Importación individual
```javascript
// En componentes específicos
import '../css/login.css';
import '../css/demo.css';
```

### Importación global
```javascript
// En layout principal para todos los estilos
import '../css/index.css';
```

## Convenciones

- Nombres de archivos en minúsculas con guiones
- Un archivo CSS por componente/página principal
- Estilos globales separados de los específicos
- Comentarios descriptivos en cada archivo