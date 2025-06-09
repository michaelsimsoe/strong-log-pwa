import { useLocation, useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { Home, Dumbbell, BarChart2, Settings } from 'lucide-react';

/**
 * Bottom navigation component for mobile-friendly navigation
 * Based on the Figma design at https://www.figma.com/design/Ad7ocwQr55WKhhNse7I9v2/Stronglog?node-id=77-441
 */
export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current route is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path;
  };

  // Get active styles for icon and text
  const getActiveStyles = (path: string) => {
    return isActive(path) ? 'opacity-100' : 'opacity-70';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <nav className="relative h-16 bg-white rounded-[60px] shadow-lg overflow-hidden border border-[#683BF3]/20">
        {/* Navigation content */}
        <div
          className="h-full flex items-center justify-around"
          data-component-name="BottomNavigation"
        >
          {/* Home Button */}
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center h-full w-20 bg-transparent"
            aria-label="Home"
          >
            <Home
              size={20}
              className={cn('mb-1 stroke-[#683BF3]', getActiveStyles('/'))}
              strokeWidth={2}
            />
            <span className={cn('text-xs font-semibold text-[#683BF3]', getActiveStyles('/'))}>
              HOME
            </span>
          </button>

          {/* Workouts Button */}
          <button
            onClick={() => navigate('/workouts')}
            className="flex flex-col items-center justify-center h-full w-20 bg-transparent"
            aria-label="Workouts"
          >
            <Dumbbell
              size={20}
              className={cn('mb-1 stroke-[#683BF3]', getActiveStyles('/workouts'))}
              strokeWidth={2}
            />
            <span
              className={cn('text-xs font-semibold text-[#683BF3]', getActiveStyles('/workouts'))}
            >
              WORKOUTS
            </span>
          </button>

          {/* History Button */}
          <button
            onClick={() => navigate('/history')}
            className="flex flex-col items-center justify-center h-full w-20 bg-transparent"
            aria-label="History"
          >
            <BarChart2
              size={20}
              className={cn('mb-1 stroke-[#683BF3]', getActiveStyles('/history'))}
              strokeWidth={2}
            />
            <span
              className={cn('text-xs font-semibold text-[#683BF3]', getActiveStyles('/history'))}
            >
              HISTORY
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center justify-center h-full w-20 bg-transparent"
            aria-label="Settings"
          >
            <Settings
              size={20}
              className={cn('mb-1 stroke-[#683BF3]', getActiveStyles('/settings'))}
              strokeWidth={2}
            />
            <span
              className={cn('text-xs font-semibold text-[#683BF3]', getActiveStyles('/settings'))}
            >
              SETTINGS
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
