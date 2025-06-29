import { renderHook, act } from '@testing-library/react';
import { useWorkoutTimer } from '../useWorkoutTimer';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useWorkoutTimer', () => {
  // Mock timers
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useWorkoutTimer());

    expect(result.current.isActive).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.displayTime).toBe('01:30'); // Default 90 seconds
    expect(result.current.mode).toBe('countdown');
  });

  it('initializes with provided values', () => {
    const { result } = renderHook(() =>
      useWorkoutTimer({
        initialDuration: 120,
        mode: 'stopwatch',
        autoStart: false,
      })
    );

    expect(result.current.displayTime).toBe('00:00'); // Stopwatch starts at 0
    expect(result.current.mode).toBe('stopwatch');
  });

  it('starts timer when autoStart is true', () => {
    const { result } = renderHook(() => useWorkoutTimer({ autoStart: true }));

    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('starts timer with start function', () => {
    const { result } = renderHook(() => useWorkoutTimer());

    act(() => {
      result.current.start();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('pauses timer with pause function', () => {
    const { result } = renderHook(() => useWorkoutTimer({ autoStart: true }));

    act(() => {
      result.current.pause();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(true);
  });

  it('resumes timer with resume function', () => {
    const { result } = renderHook(() => useWorkoutTimer({ autoStart: true }));

    // First verify that pause works
    act(() => {
      result.current.pause();
    });
    expect(result.current.isPaused).toBe(true);

    // Then test resume
    act(() => {
      result.current.resume();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('resets timer with reset function', () => {
    const { result } = renderHook(() => useWorkoutTimer({ autoStart: true }));

    // Advance time by 10 seconds
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Reset timer
    act(() => {
      result.current.reset();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.displayTime).toBe('01:30'); // Back to initial duration
  });

  it('toggles timer with toggle function', () => {
    const { result } = renderHook(() => useWorkoutTimer());

    // Start
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(false);

    // Pause
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(true);

    // Resume
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('counts down in countdown mode', () => {
    // Mock requestAnimationFrame
    const mockRequestAnimationFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(cb => {
        setTimeout(() => cb(performance.now()), 0);
        return 1;
      });

    const { result } = renderHook(() =>
      useWorkoutTimer({
        initialDuration: 10, // 10 seconds
        autoStart: true,
      })
    );

    // Initial state
    expect(result.current.displayTime).toBe('00:10');

    // Advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should be around 5 seconds left
    expect(result.current.getRemainingSeconds()).toBeLessThanOrEqual(5);

    mockRequestAnimationFrame.mockRestore();
  });

  it('counts up in stopwatch mode', () => {
    // Mock requestAnimationFrame
    const mockRequestAnimationFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(cb => {
        setTimeout(() => cb(performance.now()), 0);
        return 1;
      });

    const { result } = renderHook(() =>
      useWorkoutTimer({
        mode: 'stopwatch',
        autoStart: true,
      })
    );

    // Initial state
    expect(result.current.displayTime).toBe('00:00');

    // Advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should be around 5 seconds elapsed
    expect(result.current.getElapsedSeconds()).toBeGreaterThanOrEqual(4);

    mockRequestAnimationFrame.mockRestore();
  });

  it('calls onComplete when countdown reaches zero', () => {
    // Mock requestAnimationFrame
    const mockRequestAnimationFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(cb => {
        setTimeout(() => cb(performance.now()), 0);
        return 1;
      });

    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useWorkoutTimer({
        initialDuration: 2, // 2 seconds
        autoStart: true,
        onComplete,
      })
    );

    // Advance time past the countdown duration
    act(() => {
      vi.advanceTimersByTime(3000); // 3 seconds
    });

    // onComplete should have been called
    expect(onComplete).toHaveBeenCalled();
    expect(result.current.isActive).toBe(false);

    mockRequestAnimationFrame.mockRestore();
  });

  it('adjusts duration with adjustDuration function', () => {
    const { result } = renderHook(() =>
      useWorkoutTimer({
        initialDuration: 60, // 1 minute
      })
    );

    // Add 30 seconds
    act(() => {
      result.current.adjustDuration(30);
    });

    expect(result.current.displayTime).toBe('01:30'); // 1:30

    // Subtract 15 seconds
    act(() => {
      result.current.adjustDuration(-15);
    });

    expect(result.current.displayTime).toBe('01:15'); // 1:15
  });

  it('sets duration with setDuration function', () => {
    const { result } = renderHook(() => useWorkoutTimer());

    // Set to 2 minutes
    act(() => {
      result.current.setDuration(120);
    });

    expect(result.current.displayTime).toBe('02:00');
  });

  it('handles visibility change events', () => {
    // Mock visibility state
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: vi.fn().mockReturnValue('visible'),
    });

    const { result } = renderHook(() => useWorkoutTimer({ autoStart: true }));

    // Simulate app going to background
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: vi.fn().mockReturnValue('hidden'),
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Advance time while in background
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Simulate app coming to foreground
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: vi.fn().mockReturnValue('visible'),
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Timer should still be active
    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });
});
