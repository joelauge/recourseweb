import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileCard from './FileCard';

describe('FileCard Component', () => {
  const mockFile = {
    id: 'f1',
    name: 'Test Document',
    path: '/path/to/test.txt',
    type: 'raw',
    mb: 10,
    tags: [['blue', 'Test']],
    stats: [],
    details: {},
    addedAt: Date.now(),
    isNew: true
  };

  it('renders the file name correctly', () => {
    render(<FileCard file={mockFile} />);
    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });

  it('renders the NEW badge when isNew is true', () => {
    render(<FileCard file={mockFile} />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('does not render the NEW badge when isNew is false', () => {
    render(<FileCard file={{ ...mockFile, isNew: false }} />);
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });

  it('triggers onRename correctly', () => {
    const handleRename = vi.fn();
    render(<FileCard file={mockFile} onRename={handleRename} />);
    
    // Open context menu (simulating clicking the vertical more icon)
    const menuButtons = document.querySelectorAll('.card-action-btn');
    // Usually the menu is the last button
    fireEvent.click(menuButtons[menuButtons.length - 1]);
    
    // Click Rename
    const renameOption = screen.getByText('Rename');
    fireEvent.click(renameOption);
    
    // Find input and type
    const input = screen.getByDisplayValue('Test Document');
    fireEvent.change(input, { target: { value: 'Renamed Document' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(handleRename).toHaveBeenCalledWith('f1', 'Renamed Document');
  });
});
