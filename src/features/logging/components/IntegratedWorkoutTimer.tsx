/**
 * IntegratedWorkoutTimer Component
 *
 * This is a placeholder component that will be fully implemented in Story 2.6.
 * It provides a countdown timer for workout sets.
 */

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface IntegratedWorkoutTimerProps {
  durationSecs: number;
  onTimerComplete: () => void;
  onTimerCancel: () => void;
}

export function IntegratedWorkoutTimer({
  durationSecs,
  onTimerComplete,
  onTimerCancel,
}: IntegratedWorkoutTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationSecs);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Format seconds as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset timer
  const resetTimer = () => {
    setTimeRemaining(durationSecs);
    setIsRunning(false);
    setIsComplete(false);
  };

  // Toggle timer running state
  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsRunning(false);
            setIsComplete(true);
            onTimerComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining, onTimerComplete]);

  return (
    <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="text-4xl font-mono mb-4">{formatTime(timeRemaining)}</div>

      <div className="flex gap-2">
        {!isComplete ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTimer}
              className="flex items-center gap-1"
            >
              {isRunning ? (
                <>
                  <Pause size={16} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={16} />
                  {timeRemaining === durationSecs ? 'Start' : 'Resume'}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetTimer}
              className="flex items-center gap-1"
            >
              <RotateCcw size={16} />
              Reset
            </Button>

            <Button variant="ghost" size="sm" onClick={onTimerCancel} className="text-red-500">
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimer}
            className="flex items-center gap-1"
          >
            <RotateCcw size={16} />
            Reset Timer
          </Button>
        )}
      </div>

      {isComplete && (
        <div className="mt-2 text-green-600 font-medium">Time's up! Enter your reps.</div>
      )}
    </div>
  );
}
