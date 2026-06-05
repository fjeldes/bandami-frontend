"use client";

import { useFeedbackWidget } from "featurebase-js/react";

export default function FeaturebaseFeedback() {
  useFeedbackWidget({
    theme: "light",
    placement: "bottom-right",
    defaultBoard: "6a235199a6c09dee92619227",
  });
  return null;
}
