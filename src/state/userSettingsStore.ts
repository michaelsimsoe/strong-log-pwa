import { create } from 'zustand';
import { getUserSettings, updateUserSettings } from '../services/data/dataService';
import { userSettingsSchema } from '../types/data.types';

interface UserSettingsState {
  // Settings
  preferredWeightUnit: 'kg' | 'lbs';
  theme: 'light' | 'dark' | 'system';
  defaultRestTimerSecs: number;

  // Status
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeSettings: () => Promise<void>;
  updatePreferredWeightUnit: (unit: 'kg' | 'lbs') => Promise<void>;
  updateTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  updateDefaultRestTimer: (seconds: number) => Promise<void>;
  applyTheme: () => void;
}

export const useUserSettingsStore = create<UserSettingsState>((set, get) => ({
  // Default settings
  preferredWeightUnit: 'kg',
  theme: 'system',
  defaultRestTimerSecs: 90,

  // Status
  isLoading: false,
  error: null,

  // Actions
  initializeSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await getUserSettings();
      if (settings) {
        set({
          preferredWeightUnit: settings.preferredWeightUnit,
          theme: settings.theme,
          defaultRestTimerSecs: settings.defaultRestTimerSecs,
        });

        // Apply theme immediately after loading
        get().applyTheme();
      }
    } catch (error) {
      console.error('Failed to initialize settings:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load settings' });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePreferredWeightUnit: async unit => {
    set({ isLoading: true, error: null });
    try {
      const currentSettings = {
        preferredWeightUnit: unit,
        theme: get().theme,
        defaultRestTimerSecs: get().defaultRestTimerSecs,
      };

      // Validate with Zod schema
      const validatedSettings = userSettingsSchema.parse(currentSettings);

      // Update in database
      await updateUserSettings(validatedSettings);

      // Update state
      set({ preferredWeightUnit: unit });
    } catch (error) {
      console.error('Failed to update weight unit:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update weight unit' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTheme: async theme => {
    set({ isLoading: true, error: null });
    try {
      const currentSettings = {
        preferredWeightUnit: get().preferredWeightUnit,
        theme,
        defaultRestTimerSecs: get().defaultRestTimerSecs,
      };

      // Validate with Zod schema
      const validatedSettings = userSettingsSchema.parse(currentSettings);

      // Update in database
      await updateUserSettings(validatedSettings);

      // Update state
      set({ theme });

      // Apply theme
      get().applyTheme();
    } catch (error) {
      console.error('Failed to update theme:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update theme' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateDefaultRestTimer: async seconds => {
    set({ isLoading: true, error: null });
    try {
      const currentSettings = {
        preferredWeightUnit: get().preferredWeightUnit,
        theme: get().theme,
        defaultRestTimerSecs: seconds,
      };

      // Validate with Zod schema
      const validatedSettings = userSettingsSchema.parse(currentSettings);

      // Update in database
      await updateUserSettings(validatedSettings);

      // Update state
      set({ defaultRestTimerSecs: seconds });
    } catch (error) {
      console.error('Failed to update rest timer:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update rest timer' });
    } finally {
      set({ isLoading: false });
    }
  },

  applyTheme: () => {
    const { theme } = get();
    const root = window.document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Apply appropriate class based on theme setting
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  },
}));
