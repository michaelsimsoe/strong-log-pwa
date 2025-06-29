import { useState, useEffect, useRef, useCallback } from 'react';

type TimerMode = 'countdown' | 'stopwatch';

interface UseWorkoutTimerOptions {
  initialDuration?: number; // Initial duration in seconds (for countdown mode)
  mode?: TimerMode; // 'countdown' or 'stopwatch'
  autoStart?: boolean; // Whether to start the timer automatically
  onComplete?: () => void; // Callback when countdown reaches zero
}

interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  elapsedTime: number; // In milliseconds
  startTime: number | null; // Timestamp when timer was started/resumed
  pauseTime: number | null; // Timestamp when timer was paused
  displayTime: string; // Formatted time string (MM:SS)
}

/**
 * Custom hook for workout timer functionality
 *
 * Provides both countdown and stopwatch modes with accurate time tracking
 * and resilience to app backgrounding/foregrounding.
 */
export function useWorkoutTimer({
  initialDuration = 90, // Default 90 seconds
  mode = 'countdown',
  autoStart = false,
  onComplete,
}: UseWorkoutTimerOptions = {}) {
  // Convert initialDuration from seconds to milliseconds
  const initialDurationMs = initialDuration * 1000;

  // Format milliseconds to MM:SS string
  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Timer state
  const [state, setState] = useState<TimerState>({
    isActive: autoStart,
    isPaused: false,
    elapsedTime: 0,
    startTime: autoStart ? Date.now() : null,
    pauseTime: null,
    displayTime: formatTime(mode === 'countdown' ? initialDurationMs : 0),
  });

  // Refs for callback and animation frame
  const onCompleteRef = useRef(onComplete);
  const animationFrameId = useRef<number | null>(null);
  const modeRef = useRef(mode);
  const initialDurationMsRef = useRef(initialDurationMs);

  // Reset the timer - defined early to avoid reference before declaration
  const resetTimer = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    setState({
      isActive: false,
      isPaused: false,
      elapsedTime: 0,
      startTime: null,
      pauseTime: null,
      displayTime: formatTime(modeRef.current === 'countdown' ? initialDurationMsRef.current : 0),
    });
  }, [formatTime]);

  // Calculate current time based on mode
  const calculateTime = useCallback(() => {
    if (!state.startTime) return;

    const now = Date.now();
    const newElapsedTime = state.elapsedTime + (now - state.startTime);

    let displayTimeMs: number;
    let isComplete = false;

    if (modeRef.current === 'countdown') {
      displayTimeMs = Math.max(0, initialDurationMsRef.current - newElapsedTime);
      isComplete = displayTimeMs <= 0;
    } else {
      // Stopwatch mode
      displayTimeMs = newElapsedTime;
    }

    setState(prev => ({
      ...prev,
      elapsedTime: newElapsedTime,
      startTime: now,
      displayTime: formatTime(displayTimeMs),
    }));

    // Return whether the timer is complete
    return { isComplete, newElapsedTime };
  }, [state.elapsedTime, state.startTime, formatTime]);

  // Update timer using requestAnimationFrame for better accuracy
  const updateTimer = useCallback(() => {
    if (state.isActive && !state.isPaused) {
      const result = calculateTime();

      // Check if timer completed
      if (result?.isComplete && onCompleteRef.current) {
        onCompleteRef.current();
        // We'll handle stopping the timer here instead of in calculateTime
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }

        setState(prev => ({
          ...prev,
          isActive: false,
          isPaused: false,
          startTime: null,
          pauseTime: null,
        }));

        return; // Don't request another animation frame
      }

      animationFrameId.current = requestAnimationFrame(updateTimer);
    }
  }, [state.isActive, state.isPaused, calculateTime]);

  // Start the timer
  const startTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      startTime: Date.now(),
    }));
  }, []);

  // Pause the timer
  const pauseTimer = useCallback(() => {
    if (state.isActive && !state.isPaused) {
      calculateTime(); // Calculate time before pausing

      setState(prev => ({
        ...prev,
        isPaused: true,
        startTime: null,
        pauseTime: Date.now(),
      }));

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
  }, [state.isActive, state.isPaused, calculateTime]);

  // Resume the timer
  const resumeTimer = useCallback(() => {
    if (state.isActive && state.isPaused) {
      setState(prev => ({
        ...prev,
        isPaused: false,
        startTime: Date.now(),
        pauseTime: null,
      }));
    }
  }, [state.isActive, state.isPaused]);

  // Stop the timer
  const stopTimer = useCallback(() => {
    if (state.isActive) {
      // Calculate final time
      const result = calculateTime();
      const finalElapsedTime = result ? result.newElapsedTime : state.elapsedTime;

      setState(prev => ({
        ...prev,
        isActive: false,
        isPaused: false,
        elapsedTime: finalElapsedTime,
        startTime: null,
        pauseTime: null,
        displayTime: formatTime(
          modeRef.current === 'countdown'
            ? Math.max(0, initialDurationMsRef.current - finalElapsedTime)
            : finalElapsedTime
        ),
      }));

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
  }, [state.isActive, state.elapsedTime, calculateTime, formatTime]);

  // Update refs when props change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    modeRef.current = mode;
    initialDurationMsRef.current = initialDuration * 1000;

    // If mode changes, reset the timer
    if (modeRef.current !== mode) {
      resetTimer();
    }
  }, [onComplete, mode, initialDuration, resetTimer]);

  // Toggle timer (start/pause/resume)
  const toggleTimer = useCallback(() => {
    if (!state.isActive) {
      startTimer();
    } else if (state.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  }, [state.isActive, state.isPaused, startTimer, resumeTimer, pauseTimer]);

  // Adjust timer duration (for countdown mode)
  const adjustDuration = useCallback(
    (adjustmentSeconds: number) => {
      if (modeRef.current !== 'countdown') return;

      // Calculate new duration
      let newDurationMs: number;

      if (state.isActive) {
        // If timer is active, adjust the remaining time
        const result = calculateTime(); // Update elapsed time first
        const elapsedTime = result ? result.newElapsedTime : state.elapsedTime;
        const remainingMs = Math.max(0, initialDurationMsRef.current - elapsedTime);
        newDurationMs = Math.max(0, remainingMs + adjustmentSeconds * 1000);

        // Update initialDuration to reflect the new total duration
        initialDurationMsRef.current = elapsedTime + newDurationMs;
      } else {
        // If timer is not active, adjust the initial duration
        newDurationMs = Math.max(0, initialDurationMsRef.current + adjustmentSeconds * 1000);
        initialDurationMsRef.current = newDurationMs;
      }

      // Update display time
      setState(prev => ({
        ...prev,
        displayTime: formatTime(state.isActive ? newDurationMs : initialDurationMsRef.current),
      }));
    },
    [state.isActive, state.elapsedTime, calculateTime, formatTime]
  );

  // Set a specific duration (for countdown mode)
  const setDuration = useCallback(
    (durationSeconds: number) => {
      if (modeRef.current !== 'countdown') return;

      const durationMs = durationSeconds * 1000;
      initialDurationMsRef.current = durationMs;

      if (!state.isActive) {
        setState(prev => ({
          ...prev,
          displayTime: formatTime(durationMs),
        }));
      }
    },
    [state.isActive, formatTime]
  );

  // Get elapsed time in seconds
  const getElapsedSeconds = useCallback(() => {
    return Math.floor(state.elapsedTime / 1000);
  }, [state.elapsedTime]);

  // Get remaining time in seconds (for countdown mode)
  const getRemainingSeconds = useCallback(() => {
    if (modeRef.current !== 'countdown') return 0;
    return Math.max(0, Math.floor((initialDurationMsRef.current - state.elapsedTime) / 1000));
  }, [state.elapsedTime]);

  // Handle visibility change (app backgrounding/foregrounding)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // App is going to background
        if (state.isActive && !state.isPaused) {
          // Store the current time before backgrounding
          calculateTime();

          if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
          }
        }
      } else if (document.visibilityState === 'visible') {
        // App is coming to foreground
        if (state.isActive && !state.isPaused) {
          // Resume timer with new startTime
          setState(prev => ({
            ...prev,
            startTime: Date.now(),
          }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isActive, state.isPaused, calculateTime]);

  // Start animation frame loop when timer is active
  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      animationFrameId.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [state.isActive, state.isPaused, updateTimer]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      startTimer();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // State
    isActive: state.isActive,
    isPaused: state.isPaused,
    displayTime: state.displayTime,
    mode: modeRef.current,

    // Actions
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
    stop: stopTimer,
    reset: resetTimer,
    toggle: toggleTimer,
    adjustDuration,
    setDuration,

    // Getters
    getElapsedSeconds,
    getRemainingSeconds,
  };
}
