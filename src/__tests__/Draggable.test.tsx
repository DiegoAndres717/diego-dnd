import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { Draggable } from '../components/Draggable';

describe('Draggable', () => {
  const mockConfig = {
    id: 'test-draggable',
    type: 'test-item',
    data: { test: 'data' },
  };

  it('renders children correctly', () => {
    render(
      <Draggable config={mockConfig}>
        <div>Drag me!</div>
      </Draggable>
    );
    
    expect(screen.getByText('Drag me!')).toBeInTheDocument();
  });

  it('has draggable attribute when not disabled', () => {
    render(
      <Draggable config={mockConfig}>
        <div>Draggable content</div>
      </Draggable>
    );
    
    const draggable = screen.getByText('Draggable content').parentElement;
    expect(draggable).toHaveAttribute('draggable', 'true');
  });

  it('prevents drag when disabled', () => {
    render(
      <Draggable config={{ ...mockConfig, disabled: true }}>
        <div>Disabled content</div>
      </Draggable>
    );
    
    const draggable = screen.getByText('Disabled content').parentElement;
    expect(draggable).toHaveAttribute('draggable', 'false');
  });

  it('applies custom className', () => {
    render(
      <Draggable config={mockConfig} className="custom-class">
        <div>Content</div>
      </Draggable>
    );
    
    const draggable = screen.getByText('Content').parentElement;
    expect(draggable).toHaveClass('diego-dnd-draggable', 'custom-class');
  });

  it('handles drag start event', () => {
    const mockDataTransfer = {
      setData: vi.fn(),
      effectAllowed: '',
    };

    render(
      <Draggable config={mockConfig}>
        <div>Content</div>
      </Draggable>
    );
    
    const draggable = screen.getByText('Content').parentElement!;
    
    fireEvent.dragStart(draggable, {
      dataTransfer: mockDataTransfer,
    });
    
    expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', 'test-draggable');
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/diego-dnd', 
      JSON.stringify({
        id: 'test-draggable',
        type: 'test-item',
        data: { test: 'data' },
      })
    );
  });
});
