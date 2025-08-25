import "@google/model-viewer";

import { forwardRef, type HTMLAttributes, createElement } from "react";

type ModelViewerProps = HTMLAttributes<HTMLElement> & {
  src?: string;
  alt?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "shadow-intensity"?: number | string;
  "ios-src"?: string;
  orientation?: string;
};

const ModelViewer = forwardRef<HTMLElement, ModelViewerProps>((props, ref) => {
  return createElement("model-viewer", { ref, ...props });
});

export default ModelViewer;
