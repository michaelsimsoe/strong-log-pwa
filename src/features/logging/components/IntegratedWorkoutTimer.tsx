/**
 * IntegratedWorkoutTimer Component
 *
 * A versatile timer component that supports both countdown and stopwatch modes
 * for workout logging. Provides user-friendly controls and notifications.
 */

import { useState, useEffect, useRef } from 'react';
import { useUserSettingsStore } from '../../../state/userSettingsStore';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { Button } from '../../../components/ui/button';
import { Play, Pause, RotateCcw, Timer, Clock, Plus, Minus, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../../lib/utils';

// Import timer sound
import timerAlarmSound from '../../../assets/sounds/timer_alarm.mp3';

type TimerMode = 'countdown' | 'stopwatch';

interface IntegratedWorkoutTimerProps {
  /** Initial duration in seconds (for countdown mode) */
  initialDurationSecs?: number;
  /** Timer mode: 'countdown' or 'stopwatch' */
  mode?: TimerMode;
  /** Whether to start the timer automatically */
  autoStart?: boolean;
  /** Callback when countdown reaches zero */
  onTimerComplete?: () => void;
  /** Callback when timer is canceled */
  onTimerCancel?: () => void;
  /** Callback when stopwatch is stopped (returns elapsed seconds) */
  onStopwatchStop?: (elapsedSeconds: number) => void;
  /** CSS class for additional styling */
  className?: string;
}

export function IntegratedWorkoutTimer({
  initialDurationSecs,
  mode = 'countdown',
  autoStart = false,
  onTimerComplete,
  onTimerCancel,
  onStopwatchStop,
  className,
}: IntegratedWorkoutTimerProps) {
  // Get default rest time from user settings if no initial duration provided
  const defaultRestTimerSecs = useUserSettingsStore(state => state.defaultRestTimerSecs);
  const effectiveInitialDuration = initialDurationSecs ?? defaultRestTimerSecs;

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer state for UI feedback
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // Initialize timer hook
  const timer = useWorkoutTimer({
    initialDuration: effectiveInitialDuration,
    mode,
    autoStart,
    onComplete: () => {
      setIsCompleted(true);
      startFlashing();
      playAlarmSound();
      if (onTimerComplete) onTimerComplete();
    },
  });

  // Quick duration adjustment presets (in seconds)
  const quickAdjustments = [15, 30, 60, 90];

  // Play alarm sound when timer completes
  const playAlarmSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error('Failed to play alarm sound:', err));
    }
  };

  // Visual flashing effect when timer completes
  const startFlashing = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 3000); // Flash for 3 seconds
  };

  // Handle vibration if supported by device
  useEffect(() => {
    if (isCompleted && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]); // Vibrate pattern: 200ms on, 100ms off, 200ms on
      } catch (err) {
        console.error('Vibration API error:', err);
      }
    }
  }, [isCompleted]);

  // Handle stopwatch stop
  const handleStopwatchStop = () => {
    if (mode === 'stopwatch' && onStopwatchStop) {
      onStopwatchStop(timer.getElapsedSeconds());
    }
    timer.stop();
  };

  // Reset timer and clear completion state
  const handleReset = () => {
    setIsCompleted(false);
    setIsFlashing(false);
    timer.reset();
  };

  // Handle cancel button
  const handleCancel = () => {
    timer.stop();
    if (onTimerCancel) onTimerCancel();
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-800',
        isFlashing && 'animate-pulse bg-amber-100 dark:bg-amber-900',
        className
      )}
    >
      {/* Mode indicator */}
      <div className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
        {mode === 'countdown' ? (
          <>
            <Timer size={14} />
            <span>Countdown Timer</span>
          </>
        ) : (
          <>
            <Clock size={14} />
            <span>Stopwatch</span>
          </>
        )}
      </div>

      {/* Time display */}
      <div className="text-5xl font-mono font-bold mb-4">{timer.displayTime}</div>

      {/* Main controls */}
      <div className="flex gap-2 mb-3">
        {!isCompleted ? (
          <>
            {/* Start/Pause/Resume button */}
            <Button
              variant="default"
              size="sm"
              onClick={timer.toggle}
              className="flex items-center gap-1"
            >
              {timer.isActive && !timer.isPaused ? (
                <>
                  <Pause size={16} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={16} />
                  {!timer.isActive ? 'Start' : 'Resume'}
                </>
              )}
            </Button>

            {/* Reset button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1"
            >
              <RotateCcw size={16} />
              Reset
            </Button>

            {/* Stop button (for stopwatch) */}
            {mode === 'stopwatch' && timer.isActive && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleStopwatchStop}
                className="flex items-center gap-1"
              >
                Stop
              </Button>
            )}

            {/* Cancel button */}
            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-red-500">
              Cancel
            </Button>
          </>
        ) : (
          <>
            {/* Reset button when completed */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1"
            >
              <RotateCcw size={16} />
              Reset Timer
            </Button>

            {/* Cancel button when completed */}
            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-red-500">
              Done
            </Button>
          </>
        )}
      </div>

      {/* Duration adjustment controls (countdown mode only) */}
      {mode === 'countdown' && !isCompleted && (
        <div className="w-full">
          <div className="flex justify-center gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => timer.adjustDuration(-15)}
              disabled={timer.getRemainingSeconds() < 15}
              className="flex items-center gap-1"
            >
              <Minus size={14} /> 15s
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => timer.adjustDuration(15)}
              className="flex items-center gap-1"
            >
              <Plus size={14} /> 15s
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => timer.adjustDuration(30)}
              className="flex items-center gap-1"
            >
              <Plus size={14} /> 30s
            </Button>
          </div>

          {/* Quick preset durations */}
          <div className="flex justify-center gap-2">
            {quickAdjustments.map(seconds => (
              <Button
                key={seconds}
                variant="secondary"
                size="sm"
                onClick={() => {
                  timer.reset();
                  timer.setDuration(seconds);
                }}
                className="px-2 py-1 h-auto text-xs"
              >
                {seconds}s
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                timer.reset();
                timer.setDuration(defaultRestTimerSecs);
              }}
              className="px-2 py-1 h-auto text-xs"
            >
              Default
            </Button>
          </div>
        </div>
      )}

      {/* Completion message */}
      {isCompleted && (
        <div className="mt-2 text-green-600 dark:text-green-400 font-medium">
          {mode === 'countdown' ? "Time's up!" : 'Stopwatch stopped!'}
        </div>
      )}

      {/* Sound toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSound}
        className="absolute top-2 right-2"
        title={soundEnabled ? 'Mute sound' : 'Enable sound'}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </Button>

      {/* Hidden audio element for alarm sound */}
      <audio ref={audioRef} src={timerAlarmSound} />
    </div>
  );
}
