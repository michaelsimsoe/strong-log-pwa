// Navbar component
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface NavbarProps {
  title?: string;
  onSettingsClick?: () => void;
  className?: string;
}

/**
 * Navbar component that displays the current view's title and navigation controls.
 */
export function Navbar({ title = 'StrongLog', onSettingsClick, className }: NavbarProps) {
  return (
    <header
      className={cn(
        'bg-secondary-800 text-white py-4 px-4 shadow-md',
        'dark:bg-secondary-950',
        className
      )}
    >
      <div className="container mx-auto max-w-screen-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        {onSettingsClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="text-white hover:bg-secondary-700 dark:hover:bg-secondary-800"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}

export default Navbar;
