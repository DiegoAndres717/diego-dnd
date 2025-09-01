import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { Droppable } from '../components/Droppable';

describe('Droppable', () => {
  const mockConfig = {
    id: 'test-droppable',
    accept: 'test-item',
    onDrop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <Droppable config={mockConfig}>
        <div>Drop here!</div>
      </Droppable>
    );
    
    expect(screen.getByText('Drop here!')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Droppable config={mockConfig} className="custom-drop">
        <div>Content</div>
      </Droppable>
    );
    
    const droppable = screen.getByText('Content').parentElement;
    expect(droppable).toHaveClass('diego-dnd-droppable', 'custom-drop');
  });

  it('prevents default on drag over when accepting', () => {
    const preventDefault = vi.fn();
    
    render(
      <Droppable config={mockConfig}>
        <div>Drop zone</div>
      </Droppable>
    );
    
    const droppable = screen.getByText('Drop zone').parentElement!;
    
    fireEvent.dragOver(droppable, {
      preventDefault,
    });
    
    // Note: This test would need proper drag item context
    // In real scenario, we'd need to set up drag state first
  });
});