import { useEffect, useRef, useCallback } from "react";

export interface UseAutoRefreshOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onError?: (error: any) => void;
  immediate?: boolean; // whether to call immediately on mount
}

export const useAutoRefresh = (
  refreshFunction: () => Promise<void> | void,
  options: UseAutoRefreshOptions = {}
) => {
  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    onError,
    immediate = false,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isEnabledRef = useRef(enabled);

  // Update the enabled state
  useEffect(() => {
    isEnabledRef.current = enabled;
  }, [enabled]);

  const startRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!isEnabledRef.current) return;

    intervalRef.current = setInterval(async () => {
      if (!isEnabledRef.current) return;

      try {
        await refreshFunction();
      } catch (error) {
        console.error("Auto-refresh error:", error);
        onError?.(error);
      }
    }, interval);
  }, [refreshFunction, interval, onError]);

  const stopRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refreshNow = useCallback(async () => {
    try {
      await refreshFunction();
    } catch (error) {
      console.error("Manual refresh error:", error);
      onError?.(error);
    }
  }, [refreshFunction, onError]);

  // Start auto-refresh when enabled
  useEffect(() => {
    if (enabled) {
      if (immediate) {
        refreshNow();
      }
      startRefresh();
    } else {
      stopRefresh();
    }

    return () => {
      stopRefresh();
    };
  }, [enabled, startRefresh, stopRefresh, immediate, refreshNow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRefresh();
    };
  }, [stopRefresh]);

  // Pause/resume when tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRefresh();
      } else if (isEnabledRef.current) {
        startRefresh();
        // Refresh immediately when tab becomes visible again
        refreshNow();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startRefresh, stopRefresh, refreshNow]);

  return {
    startRefresh,
    stopRefresh,
    refreshNow,
    isEnabled: enabled,
  };
};
