import React, { useEffect, useRef } from "react";

type Props = {
  src: string;
  alt?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
  iosSrc?: string; // optional .usdz for iOS Quick Look
  ar?: boolean; // enable AR
};

const ModelViewerWrapper: React.FC<Props> = ({
  src,
  alt,
  autoRotate = true,
  cameraControls = true,
  className,
  style,
  iosSrc,
  ar = true,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // if we already created a viewer, update attributes
    if (viewerRef.current) {
      const v = viewerRef.current;
      v.setAttribute("src", src);
      if (alt) v.setAttribute("alt", alt);
      if (autoRotate) v.setAttribute("auto-rotate", "");
      else v.removeAttribute("auto-rotate");
      if (cameraControls) v.setAttribute("camera-controls", "");
      else v.removeAttribute("camera-controls");

      if (ar) v.setAttribute("ar", "");
      else v.removeAttribute("ar");

      // enable multiple AR modes: WebXR, scene-viewer (Android), quick-look (iOS)
      v.setAttribute("ar-modes", "webxr scene-viewer quick-look");

      if (iosSrc) v.setAttribute("ios-src", iosSrc);
      else v.removeAttribute("ios-src");

      return;
    }

    const el = document.createElement("model-viewer");
    el.setAttribute("src", src);
    if (alt) el.setAttribute("alt", alt);
    if (autoRotate) el.setAttribute("auto-rotate", "");
    if (cameraControls) el.setAttribute("camera-controls", "");

    if (ar) el.setAttribute("ar", "");
    el.setAttribute("ar-modes", "webxr scene-viewer quick-look");

    if (iosSrc) el.setAttribute("ios-src", iosSrc);

    // recommended attributes for better AR experience
    el.setAttribute("loading", "auto");
    el.setAttribute("style", "width:100%;height:100%;display:block;");

    container.appendChild(el);
    viewerRef.current = el;

    return () => {
      if (viewerRef.current && container) {
        container.removeChild(viewerRef.current);
        viewerRef.current = null;
      }
    };
  }, [src, alt, autoRotate, cameraControls, iosSrc, ar]);

  return <div ref={ref} className={className} style={style} />;
};

export default ModelViewerWrapper;
