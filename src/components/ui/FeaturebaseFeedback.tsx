"use client";

import { useFeedbackWidget } from "featurebase-js/react";

export default function FeaturebaseFeedback() {
  useFeedbackWidget({
    theme: "light",
    placement: "bottom-right",
  });
  return null;
}
