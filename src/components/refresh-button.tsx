'use client';
import { Button } from "@/components/ui/button";

export const RefreshButton = () => {
  return (
    <Button variant="outline" onClick={() => window.location.reload()}>
      Refresh Data
    </Button>
  );
};

export const ErrorRefreshButton = () => {
  return (
    <Button onClick={() => window.location.reload()}>
      Refresh Page
    </Button>
  );
};
