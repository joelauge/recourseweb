import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Session from './Session';

describe('Session Component', () => {
  const mockSession = {
    id: 's1',
    label: 'Session 1',
    files: [
      { id: 'f1', name: 'File A', type: 'raw', path: 'session/{sid}/a.raw', addedAt: 1000, state: 'READY', tags: [], stats: [], details: {} },
      { id: 'f2', name: 'File B', type: 'kb', path: 'session/{sid}/b.kb', addedAt: 2000, state: 'READY', tags: [], stats: [], details: {} }
    ]
  };

  it('renders session header and file list', () => {
    render(<Session session={mockSession} isActive={true} isOverLimit={false} sessionPct={0} availableSessions={[]} />);
    expect(screen.getByText('File A')).toBeInTheDocument();
    expect(screen.getByText('File B')).toBeInTheDocument();
  });

  it('displays empty state when no files exist', () => {
    render(<Session session={{...mockSession, files: []}} isActive={true} isOverLimit={false} sessionPct={0} availableSessions={[]} />);
    expect(screen.getByText('Your Workspace is Empty')).toBeInTheDocument();
  });

  it('sorts files by name correctly', () => {
    const { container } = render(<Session session={mockSession} isActive={true} isOverLimit={false} sessionPct={0} availableSessions={[]} />);
    
    // Select the A-Z sorting option
    const select = document.querySelector('.sort-select');
    fireEvent.change(select, { target: { value: 'name_asc' } });
    
    const fileNames = Array.from(document.querySelectorAll('.file-name')).map(el => el.textContent);
    expect(fileNames[0]).toBe('File A');
    expect(fileNames[1]).toBe('File B');
  });

  it('disables input when storage is full', () => {
    const { container } = render(<Session session={mockSession} isActive={true} isOverLimit={true} sessionPct={100} availableSessions={[]} />);
    
    // First, select a file to show the input
    const firstFile = screen.getByText('File A').closest('.file-card');
    fireEvent.click(firstFile);

    const textarea = screen.getByPlaceholderText(/Storage limit reached/i);
    expect(textarea).toBeDisabled();
  });
});
