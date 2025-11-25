import { render, screen, fireEvent, act } from '@testing-library/react';
import { Timer } from '../components/Timer';
import { describe, it, expect, vi } from 'vitest';

describe('Timer Component', () => {
  it('renders correctly with initial time', () => {
    render(<Timer initialMinutes={25} onComplete={() => {}} />);
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('starts countdown when Start button is clicked', () => {
    vi.useFakeTimers();
    render(<Timer initialMinutes={25} onComplete={() => {}} />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('24:59')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
