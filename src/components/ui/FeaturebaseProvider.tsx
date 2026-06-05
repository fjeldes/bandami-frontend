"use client";

import { FeaturebaseProvider as FBProvider } from "featurebase-js/react";

export default function FeaturebaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <FBProvider appId="6a235199a6c09dee9261921f">
      {children}
    </FBProvider>
  );
}
