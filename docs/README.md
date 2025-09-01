# 📚 Documentación Diego DnD v2.0

¡Bienvenido a la documentación completa de diego-dnd! Aquí encontrarás todo lo que necesitas para dominar esta librería.

## 🚀 Empezar Rápido

**¿Primera vez con diego-dnd?** Empieza aquí:

- [**Quick Start**](quick-start.md) - Tu primera lista en 5 minutos ⚡
- [**Ejemplos Básicos**](examples/02-todo-list.md) - Lista reordenable simple

## 🎯 Ejemplos Prácticos

Aprende viendo ejemplos reales con GIFs y código completo:

| Ejemplo | Dificultad | Demo | Código |
|---------|------------|------|--------|
| [Lista Simple](examples/01-basic-list.md) | ⭐ | ![Lista](assets/gifs/basic-list.gif) | [Ver código](examples/01-basic-list.md#código-completo) |
| [Lista de Tareas](examples/02-todo-list.md) | ⭐ | ![Todo](assets/gifs/todo-list.gif) | [Ver código](examples/02-todo-list.md#código-completo) |
| [Subir Archivos](examples/03-file-uploader.md) | ⭐⭐ | ![Files](assets/gifs/file-uploader.gif) | [Ver código](examples/03-file-uploader.md#código-completo) |
| [Kanban Board](examples/04-kanban-board.md) | ⭐⭐ | ![Kanban](assets/gifs/kanban-board.gif) | [Ver código](examples/04-kanban-board.md#código-completo) |
| [Carpetas Anidadas](examples/05-nested-folders.md) | ⭐⭐⭐ | ![Nested](assets/gifs/nested-folders.gif) | [Ver código](examples/05-nested-folders.md#código-completo) |
| [Componentes Propios](examples/06-custom-components.md) | ⭐⭐⭐ | - | [Ver código](examples/06-custom-components.md#código-completo) |

## 📖 Referencia de API

Documentación detallada de todos los componentes y funciones:

- [**Componentes**](api/components.md) - `<SortableList>`, `<Draggable>`, `<Droppable>`
- [**Hooks**](api/hooks.md) - `useDrag`, `useDrop`, `useDndContext`
- [**Tipos**](api/types.md) - Interfaces y tipos de TypeScript
- [**Utilidades**](api/utils.md) - Funciones helper

## 📚 Guías Detalladas

Profundiza en temas específicos:

- [**Personalizar Estilos**](guides/styling.md) - CSS y temas personalizados
- [**Accesibilidad**](guides/accessibility.md) - A11y y navegación por teclado
- [**Performance**](guides/performance.md) - Optimización para listas grandes
- [**Testing**](guides/testing.md) - Cómo testear tus componentes
- [**Migración v1→v2**](guides/migration.md) - Actualizar desde v1.x

## ❓ Ayuda y Solución de Problemas

- [**Troubleshooting**](troubleshooting.md) - Problemas comunes y soluciones
- [**FAQ**](faq.md) - Preguntas frecuentes
- [**GitHub Issues**](https://github.com/DiegoAndres717/diego-dnd/issues) - Reportar bugs o pedir features

## 🎓 Por Dónde Empezar

**Según tu nivel:**

### 🟢 Principiante (Primera vez con DnD)
1. [Quick Start](quick-start.md) - Conceptos básicos
2. [Lista Simple](examples/01-basic-list.md) - Primer ejemplo
3. [Lista de Tareas](examples/02-todo-list.md) - Ejemplo práctico
4. [Personalizar Estilos](guides/styling.md) - Hacer que se vea bien

### 🟡 Intermedio (Tienes experiencia con React)
1. [File Uploader](examples/03-file-uploader.md) - Zona de drop
2. [Kanban Board](examples/04-kanban-board.md) - Múltiples zonas
3. [API Components](api/components.md) - Conocer todas las opciones
4. [Testing](guides/testing.md) - Asegurar calidad

### 🔴 Avanzado (Quieres personalización completa)
1. [Componentes Personalizados](examples/06-custom-components.md) - Hooks y API de bajo nivel
2. [Performance](guides/performance.md) - Optimización avanzada
3. [Contribuir](../CONTRIBUTING.md) - Ayudar a mejorar la librería

## 💡 Consejos Rápidos

**Para desarrollar más rápido:**

```bash
# Instalar y usar inmediatamente
npm install diego-dnd
```

```tsx
// El mínimo código para empezar
import { DndProvider, SortableList } from 'diego-dnd';
import 'diego-dnd/dist/diego-dnd.css';

function App() {
  const [items, setItems] = useState([
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' }
  ]);

  return (
    <DndProvider>
      <SortableList
        items={items}
        onReorder={setItems}
        renderItem={item => <div>{item.name}</div>}
      />
    </DndProvider>
  );
}
```

## 🔥 Demos en Vivo

- [CodeSandbox Playground](https://codesandbox.io/s/diego-dnd-playground) - Juega con los ejemplos
- [Storybook](https://diegodnd.netlify.app) - Todos los componentes documentados

## 🤝 Comunidad

- [Discord](https://discord.gg/diego-dnd) - Chat y ayuda en tiempo real
- [GitHub Discussions](https://github.com/DiegoAndres717/diego-dnd/discussions) - Preguntas y debates
- [Twitter](https://twitter.com/diego_dnd) - Novedades y tips

---

**¿No encuentras lo que buscas?** [Abre un issue](https://github.com/DiegoAndres717/diego-dnd/issues/new) y te ayudamos.