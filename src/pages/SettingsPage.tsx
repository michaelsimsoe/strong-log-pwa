import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUserSettingsStore } from '@/state/userSettingsStore';
import PageWrapper from '@/components/layout/PageWrapper';

/**
 * Settings page component that allows users to configure their preferences.
 */
export function SettingsPage() {
  const navigate = useNavigate();
  const {
    preferredWeightUnit,
    theme,
    isLoading,
    error,
    updatePreferredWeightUnit,
    updateTheme,
    initializeSettings,
  } = useUserSettingsStore();

  // Load settings on component mount
  useEffect(() => {
    initializeSettings();
  }, [initializeSettings]);

  // Handle weight unit change
  const handleWeightUnitChange = (value: string) => {
    if (value === 'kg' || value === 'lbs') {
      updatePreferredWeightUnit(value);
    }
  };

  // Handle theme change
  const handleThemeChange = (value: string) => {
    if (value === 'light' || value === 'dark' || value === 'system') {
      updateTheme(value);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageWrapper className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure your preferences for the application.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded-md dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Exercise Management */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50">
                Exercise Management
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create, edit, and manage your custom exercises.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate('/exercises')}
                className="px-4 py-2 bg-[#683BF3] text-white rounded-md hover:bg-[#5930d0] transition-colors"
                aria-label="Manage Exercises"
              >
                Manage Exercises
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          {/* Weight Units Setting */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50">Weight Units</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred unit for weight measurements.
              </p>
            </div>

            <RadioGroup
              value={preferredWeightUnit}
              onValueChange={handleWeightUnitChange}
              className="flex flex-col space-y-2"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kg" id="kg" />
                <Label htmlFor="kg" className="cursor-pointer">
                  Kilograms (kg)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lbs" id="lbs" />
                <Label htmlFor="lbs" className="cursor-pointer">
                  Pounds (lbs)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Theme Setting */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50">Appearance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred application theme.
              </p>
            </div>

            <RadioGroup
              value={theme}
              onValueChange={handleThemeChange}
              className="flex flex-col space-y-2"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="cursor-pointer">
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="cursor-pointer">
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="cursor-pointer">
                  System (follows your device settings)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">Saving settings...</p>
          </div>
        )}
      </PageWrapper>
    </div>
  );
}

export default SettingsPage;
