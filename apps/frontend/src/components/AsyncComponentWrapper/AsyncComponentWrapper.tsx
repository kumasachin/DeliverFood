import React, { Suspense, ReactNode } from "react";
import { ErrorBoundary } from "../ErrorBoundary";
import { LoadingSpinner } from "../LoadingSpinner";

interface AsyncComponentWrapperProps {
  children: ReactNode;
  loadingMessage?: string;
  onError?: () => void;
}

export const AsyncComponentWrapper: React.FC<AsyncComponentWrapperProps> = ({
  children,
  loadingMessage = "Loading...",
  onError,
}) => {
  const handleError = onError || (() => window.location.reload());

  return (
    <ErrorBoundary onReset={handleError}>
      <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
