# Diego DnD v2.0

![npm version](https://img.shields.io/npm/v/diego-dnd)
![license](https://img.shields.io/npm/l/diego-dnd)
![downloads](https://img.shields.io/npm/dm/diego-dnd)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

Una librería moderna de drag and drop para React, diseñada para ser **simple, accesible y poderosa**.

## ✨ Características Principales

- **🚀 API Simple**: Empieza con una línea de código
- **📱 Accesibilidad**: Soporte completo para lectores de pantalla y teclado  
- **⚡ Rendimiento**: Optimizada para aplicaciones grandes
- **🎨 Personalizable**: Estilos CSS completamente configurables
- **📦 TypeScript**: Tipado completo incluido
- **📱 Responsive**: Funciona en desktop y móvil
- **🧪 Testeada**: 100% cobertura con Vitest
- **🌟 Zero Dependencies**: Sin dependencias externas

## 📦 Instalación

```bash
npm install diego-dnd
# o
yarn add diego-dnd
# o  
pnpm add diego-dnd
```

## 🚀 Quick Start (30 segundos)

### Lista Reordenable

```tsx
import { DndProvider, SortableList } from 'diego-dnd';
import 'diego-dnd/dist/diego-dnd.css';

function App() {
  const [items, setItems] = useState([
    { id: '1', name: 'Tarea 1' },
    { id: '2', name: 'Tarea 2' },
    { id: '3', name: 'Tarea 3' }
  ]);

  return (
    <DndProvider>
      <SortableList
        items={items}
        onReorder={setItems}
        renderItem={(item) => (
          <div className="task">{item.name}</div>
        )}
      />
    </DndProvider>
  );
}
```

**¡Eso es todo!** Ya tienes una lista completamente funcional con drag & drop.

## 📖 Guías por Nivel

### 🔰 Principiante
- [Quick Start](docs/quick-start.md) - Primeros pasos
- [Componentes Básicos](docs/basic-components.md) - Draggable y Droppable
- [Estilos CSS](docs/styling.md) - Personalización visual

### 🔥 Intermedio  
- [SortableList Avanzada](docs/sortable-advanced.md) - Configuraciones avanzadas
- [Múltiples Zonas](docs/multiple-zones.md) - Kanban boards
- [Validación de Drops](docs/drop-validation.md) - Control de compatibilidad

### 🚀 Avanzado
- [Hooks Personalizados](docs/custom-hooks.md) - useDrag y useDrop
- [Integración con Estado](docs/state-integration.md) - Redux, Zustand
- [Testing](docs/testing.md) - Cómo testear componentes DnD

## 📚 API Reference

### Componentes de Alto Nivel

| Componente | Uso | Complejidad |
|------------|-----|-------------|
| `<SortableList>` | Listas reordenables | ⭐ |
| `<DragDropArea>` | Zonas de drop simples | ⭐ |
| `<KanbanBoard>` | Tableros estilo Trello | ⭐⭐ |

### Componentes Básicos

| Componente | Uso | Complejidad |
|------------|-----|-------------|
| `<Draggable>` | Elementos arrastrables | ⭐⭐ |
| `<Droppable>` | Zonas de destino | ⭐⭐ |
| `<DragPreview>` | Vista previa personalizada | ⭐⭐⭐ |

### Hooks

| Hook | Uso | Complejidad |
|------|-----|-------------|
| `useDndContext` | Acceder al estado global | ⭐⭐ |
| `useDrag` | Crear arrastrables personalizados | ⭐⭐⭐ |
| `useDrop` | Crear zonas drop personalizadas | ⭐⭐⭐ |

### Componentes de Alto Nivel

#### `<SortableList>`

Para listas reordenables (90% de casos de uso):

```tsx
<SortableList
  items={items}                    // Array de objetos con id
  onReorder={(newOrder) => {}}     // Callback cuando cambia el orden
  renderItem={(item, index) => {}} // Cómo renderizar cada item
  direction="vertical"             // 'vertical' | 'horizontal'
  disabled={false}                 // Deshabilitar completamente
  className="mi-lista"            // Clase CSS del contenedor
  itemClassName="mi-item"         // Clase CSS de cada item
  dragClassName="arrastrando"     // Clase durante el arrastre
  placeholder={<div>Vacío</div>}  // Qué mostrar si está vacía
/>
```

#### `<DragDropArea>`

Para zonas de drop simples:

```tsx
<DragDropArea
  accept={['file', 'image']}      // Tipos aceptados
  onDrop={(items) => {}}          // Callback al soltar
  multiple={true}                 // Permitir múltiples items
  disabled={false}               // Deshabilitar
  className="zona-drop"          // Clase CSS
  activeClassName="activa"       // Clase cuando hay drag sobre
>
  Contenido de la zona
</DragDropArea>
```

### Componentes Básicos

#### `<Draggable>`

```tsx
<Draggable
  config={{
    id: "unique-id",              // ID único
    type: "document",             // Tipo de elemento
    data: { custom: "data" },     // Datos personalizados
    disabled: false               // Deshabilitar
  }}
  className="draggable"
  dragClassName="dragging"
>
  Contenido arrastrable
</Draggable>
```

#### `<Droppable>`

```tsx
<Droppable
  config={{
    id: "drop-zone",              // ID único
    accept: ["document", "image"], // Tipos aceptados
    onDrop: (result) => {},       // Callback al soltar
    disabled: false               // Deshabilitar
  }}
  className="droppable"
  activeClassName="active"
>
  Zona de destino
</Droppable>
```

### Hooks Avanzados

#### `useDrag`

```tsx
function CustomDraggable() {
  const { ref, dragProps, isDragging } = useDrag({
    id: 'item-1',
    type: 'custom',
    data: { foo: 'bar' }
  });

  return (
    <div ref={ref} {...dragProps}>
      {isDragging ? 'Arrastrando...' : 'Arrástrame'}
    </div>
  );
}
```

#### `useDrop`

```tsx
function CustomDroppable() {
  const { ref, dropProps, isOver, canDrop } = useDrop({
    id: 'drop-1',
    accept: 'custom',
    onDrop: (result) => console.log(result)
  });

  return (
    <div 
      ref={ref} 
      {...dropProps}
      style={{ 
        backgroundColor: isOver && canDrop ? 'lightblue' : 'white' 
      }}
    >
      {isOver && canDrop ? 'Suelta aquí' : 'Zona de drop'}
    </div>
  );
}
```

## 🎨 Personalización CSS

La librería incluye estilos por defecto, pero son completamente personalizables:

```css
/* Elemento siendo arrastrado */
.diego-dnd-dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

/* Zona activa de drop */
.diego-dnd-active {
  background-color: rgba(59, 130, 246, 0.1);
  border: 2px dashed #3b82f6;
}

/* Lista sorteable */
.diego-dnd-sortable-list {
  gap: 8px;
}

/* Área de drop vacía */
.diego-dnd-drop-area.diego-dnd-empty::before {
  content: 'Personalizar mensaje aquí';
}
```

## 🔧 Utilidades

```tsx
import { 
  generateId,      // Generar ID único
  reorderArray,    // Reordenar array
  findIndexById,   // Encontrar índice por ID
  insertAt,        // Insertar en posición
  removeById       // Remover por ID
} from 'diego-dnd';

// Ejemplo de uso
const newOrder = reorderArray(items, 0, 2); // Mover item de posición 0 a 2
const index = findIndexById(items, 'item-1'); // Encontrar posición de item
```

## 🛠 Desarrollo y Testing

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Testing
npm run test

# Coverage
npm run test:coverage

# Linting
npm run lint
```

## 🤝 Migración desde v1.x

Si vienes de la versión anterior, consulta nuestra [Guía de Migración](docs/migration.md).

**Principales cambios:**
- API simplificada (menos configuración)
- Mejor accesibilidad
- Componentes de alto nivel incluidos
- Performance mejorada
- Testing incluido

## 📊 Comparación con Otras Librerías

| Característica | diego-dnd v2 | react-beautiful-dnd | @dnd-kit |
|----------------|--------------|---------------------|----------|
| **Tamaño** | ~12kb | ~32kb | ~25kb |
| **TypeScript** | ✅ Nativo | ✅ | ✅ |
| **Accesibilidad** | ✅ Completa | ⚠️ Básica | ✅ |
| **Mobile** | ✅ | ❌ | ✅ |
| **Nested DnD** | ✅ | ❌ | ✅ |
| **Learning Curve** | 🟢 Fácil | 🟡 Media | 🔴 Difícil |

## 🐛 Troubleshooting

### Problemas Comunes

**El arrastre no funciona en móvil:**
```tsx
// Añadir touch-action: none
.diego-dnd-draggable {
  touch-action: none;
}
```

**Los elementos no se actualizan:**
```tsx
// Asegúrate de que cada item tiene un `id` único
const items = data.map(item => ({ ...item, id: item.id || generateId() }));
```

**TypeScript da errores:**
```tsx
// Instala los tipos si usas TypeScript < 4.5
npm install @types/react@latest
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit (`git commit -am 'Añadir nueva característica'`)
4. Push (`git push origin feature/nueva-caracteristica`)  
5. Abre un Pull Request

**Antes de contribuir:**
- Ejecuta `npm run test` 
- Ejecuta `npm run lint`
- Añade tests para nuevas características
- Actualiza la documentación

## 📝 Changelog

### v2.0.0 (2024-01-15)
- ✨ **BREAKING**: API completamente rediseñada
- ✨ Componentes de alto nivel (`SortableList`, `DragDropArea`)
- ✨ Accesibilidad mejorada (ARIA, teclado)  
- ✨ Performance optimizada
- ✨ Testing con Vitest incluido
- 🐛 Correcciones de memory leaks
- 📚 Documentación completa

### v1.x
- Ver [changelog completo](CHANGELOG.md)

## 🙏 Agradecimientos

Gracias a todos los [contributors](https://github.com/DiegoAndres717/diego-dnd/graphs/contributors) que han hecho posible esta librería.

## 📄 Licencia

MIT © [Diego Andrés Salas](https://github.com/DiegoAndres717)

---

<p align="center">
  <strong>¿Te gusta diego-dnd? ⭐ Dale una estrella en GitHub</strong>
</p>