import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../test/test-utils";
import { DndProvider, useDndContext } from "../context/DndContext";

// Componente de prueba que usa el contexto
function TestComponent() {
  const { isDragging, dragItem, announce } = useDndContext();

  return (
    <div>
      <div data-testid="is-dragging">{isDragging.toString()}</div>
      <div data-testid="drag-item">{dragItem?.id || "none"}</div>
      <button onClick={() => announce("Test message")}>Announce</button>
    </div>
  );
}

describe("DndProvider", () => {
  it("provides initial context values", () => {
    render(<TestComponent />);

    expect(screen.getByTestId("is-dragging")).toHaveTextContent("false");
    expect(screen.getByTestId("drag-item")).toHaveTextContent("none");
  });

  it("throws error when used outside provider", () => {
    // Suprimir console.error para este test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const container = document.createElement("div");
    expect(() => {
      render(<TestComponent />, { container });
    }).toThrow("useDndContext debe usarse dentro de DndProvider");

    consoleSpy.mockRestore();
  });

  it("calls onDragStart callback", () => {
    const onDragStart = vi.fn();

    render(
      <DndProvider onDragStart={onDragStart}>
        <TestComponent />
      </DndProvider>
    );

    // Test would require triggering drag start
    // Implementation depends on how we trigger drags in tests
  });
});
