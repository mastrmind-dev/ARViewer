// Module-aware global augmentation so TypeScript reliably merges the JSX namespace
import * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        alt?: string;
        "auto-rotate"?: boolean | string;
        "camera-controls"?: boolean | string;
        style?: React.CSSProperties;
      };
    }
  }
}

export {};
