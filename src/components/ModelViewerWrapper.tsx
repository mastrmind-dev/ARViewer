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
  const axesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // ensure container is positioned so overlay can be absolute
    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }

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

      // Update AR attributes
      v.setAttribute("ar-modes", "webxr scene-viewer quick-look");
      v.setAttribute("ar-scale", "auto");
      v.setAttribute("ar-placement", "floor");
      v.setAttribute("orientation", "0 0 0");
      v.setAttribute("scale", "1 1 1");
      v.setAttribute("auto-rotate", "false");

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
      // ar-modes will be set later with additional attributes

    if (iosSrc) el.setAttribute("ios-src", iosSrc);

    // recommended attributes for better AR experience
    el.setAttribute("loading", "auto");
    el.setAttribute("style", "width:100%;height:100%;display:block;");

    // Remove fixed camera-orbit to allow natural AR positioning
    // el.setAttribute("camera-orbit", "0deg 270deg auto"); // Adjust orientation for showroom
    el.setAttribute("field-of-view", "45deg"); // Optional: Adjust field of view for better framing
    el.setAttribute("environment-image", "neutral"); // Add environment for better AR alignment
    
    // AR-specific attributes for proper orientation handling
    el.setAttribute("ar-modes", "webxr scene-viewer quick-look");
    el.setAttribute("ar-scale", "auto");
    el.setAttribute("ar-placement", "floor");
    el.setAttribute("ar-button", "");
    el.setAttribute("ar-status", "");
    
    // Critical: Force model to be horizontal and disable auto-rotation
    el.setAttribute("orientation", "0 0 0");
    el.setAttribute("scale", "1 1 1");
    el.setAttribute("auto-rotate", "false");
    
    // Ensure no forced camera positioning
    el.setAttribute("camera-orbit", "auto auto auto");
    el.setAttribute("camera-target", "0 0 0");
    
    // Enable shadows and interactions for better AR experience
    el.setAttribute("shadow-intensity", "1");
    el.setAttribute("shadow-softness", "0.5");
    el.setAttribute("interaction-prompt", "auto");

    container.appendChild(el);
    viewerRef.current = el;

    // create axes overlay
    const axes = document.createElement("div");
    axes.style.position = "absolute";
    axes.style.left = "12px";
    axes.style.bottom = "12px";
    axes.style.width = "96px";
    axes.style.height = "96px";
    axes.style.pointerEvents = "none";
    axes.style.zIndex = "10";

    // SVG markup: X (red), Y (green), Z (blue) arrows
    axes.innerHTML = `
      <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(50,50)">
          <g id="xy-plane">
            <line x1="0" y1="0" x2="30" y2="0" stroke="red" stroke-width="3" marker-end="url(#arrow)" />
            <line x1="0" y1="0" x2="0" y2="-30" stroke="green" stroke-width="3" marker-end="url(#arrow)" />
          </g>
          <g id="z-axis" transform="translate(0,0)">
            <line x1="0" y1="0" x2="21" y2="-21" stroke="blue" stroke-width="3" marker-end="url(#arrow)" />
          </g>
        </g>
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="currentColor" />
          </marker>
        </defs>
      </svg>
    `;

    container.appendChild(axes);
    axesRef.current = axes;

    // update axes according to camera orbit
    const updateAxes = () => {
      try {
        const vAny = viewerRef.current as unknown as {
          getCameraOrbit?: () => {
            theta?: number;
            phi?: number;
            radius?: number;
          };
        };
        if (!vAny || !axesRef.current) return;

        const orbit = vAny.getCameraOrbit && vAny.getCameraOrbit();
        if (!orbit) return;
        const theta = orbit.theta ?? 0; // radians
        const phi = orbit.phi ?? 0; // radians

        // rotate XY plane group by -theta (convert to degrees)
        const deg = (-theta * 180) / Math.PI;
        const svg = axesRef.current.querySelector("svg") as SVGElement | null;
        if (svg) {
          const xy = svg.querySelector("#xy-plane") as SVGGElement | null;
          const z = svg.querySelector("#z-axis") as SVGGElement | null;
          if (xy) xy.setAttribute("transform", `rotate(${deg})`);

          // tilt z-axis opacity/scale based on phi to give depth hint
          if (z) {
            const opacity = Math.max(0.4, Math.cos(phi));
            (z as SVGElement).style.opacity = String(opacity);
          }
        }
      } catch {
        // ignore errors from element API
      }
    };

    el.addEventListener("camera-change", updateAxes);
    // initial update
    setTimeout(updateAxes, 50);

    // Handle model loading to ensure proper orientation
    el.addEventListener("load", () => {
      console.log("Model loaded, setting AR orientation");
      // Reset any forced orientation when model loads
      el.removeAttribute("camera-orbit");
      el.removeAttribute("camera-target");
      
      // Try to reset model transform
      try {
        const modelViewer = el as any;
        if (modelViewer.model) {
          console.log("Model loaded, checking transform");
          // Reset model transform to identity
          modelViewer.model.setTransform([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
          
          // Also try to set the model's rotation directly
          if (modelViewer.model.rotation) {
            modelViewer.model.rotation.set(0, 0, 0);
            console.log("Reset model rotation to 0,0,0");
          }
          
          // Try to access the scene and reset its rotation
          if (modelViewer.model.scene) {
            modelViewer.model.scene.rotation.set(0, 0, 0);
            console.log("Reset scene rotation to 0,0,0");
          }
          
          // Try to use model-viewer's built-in methods
          if (modelViewer.setCameraOrbit) {
            modelViewer.setCameraOrbit(0, 0, 0);
            console.log("Set camera orbit to 0,0,0");
          }
          
          // Force the orientation attribute again
          modelViewer.setAttribute("orientation", "0 0 0");
          modelViewer.setAttribute("scale", "1 1 1");
          modelViewer.setAttribute("auto-rotate", "false");
          
          // Try to access the model's children and reset their rotation
          if (modelViewer.model.scene && modelViewer.model.scene.children) {
            modelViewer.model.scene.children.forEach((child: any) => {
              if (child.rotation) {
                child.rotation.set(0, 0, 0);
                console.log("Reset child rotation to 0,0,0");
              }
            });
          }
          
          // Try to use the model-viewer's camera methods
          if (modelViewer.camera) {
            modelViewer.camera.position.set(0, 0, 0);
            modelViewer.camera.rotation.set(0, 0, 0);
            console.log("Reset camera position and rotation");
          }
          
          // Final attempt: try to use the model-viewer's built-in methods
          if (modelViewer.setAttribute) {
            console.log("Final attempt: setting all orientation attributes");
            modelViewer.setAttribute("orientation", "0 0 0");
            modelViewer.setAttribute("scale", "1 1 1");
            modelViewer.setAttribute("auto-rotate", "false");
            modelViewer.setAttribute("camera-orbit", "auto auto auto");
            modelViewer.setAttribute("camera-target", "0 0 0");
          }
          
          // Try to use the model-viewer's built-in methods for AR
          if (modelViewer.ar) {
            console.log("AR is enabled, trying to reset AR orientation");
            // Force AR-specific attributes
            modelViewer.setAttribute("ar-placement", "floor");
            modelViewer.setAttribute("ar-scale", "auto");
            modelViewer.setAttribute("orientation", "0 0 0");
          }
        }
      } catch (e) {
        console.log("Could not reset model transform:", e);
      }
      
      // Additional debugging
      console.log("Model viewer attributes:", {
        orientation: el.getAttribute("orientation"),
        scale: el.getAttribute("scale"),
        cameraOrbit: el.getAttribute("camera-orbit"),
        cameraTarget: el.getAttribute("camera-target")
      });
    });

    el.addEventListener("ar-status", (event) => {
      const customEvent = event as CustomEvent;
      console.log("AR status:", customEvent.detail.status);
      if (customEvent.detail.status === "session-started") {
        // Remove forced orientation - let AR handle positioning naturally
        // el.setAttribute("camera-orbit", "0deg 270deg 0deg"); // Reapply orientation for AR
        console.log("AR session started - allowing natural orientation");
        
        // Ensure model is properly positioned for AR
        el.setAttribute("ar-placement", "floor");
        el.setAttribute("ar-scale", "auto");
        
        // Try to force horizontal orientation in AR
        setTimeout(() => {
          try {
            const modelViewer = el as any;
            if (modelViewer.model) {
              console.log("Forcing horizontal orientation in AR");
              // Force the model to be horizontal
              modelViewer.setAttribute("orientation", "0 0 0");
              modelViewer.setAttribute("scale", "1 1 1");
              
              // Try to reset the model transform
              if (modelViewer.model.setTransform) {
                modelViewer.model.setTransform([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
                console.log("Reset model transform in AR");
              }
              
              // Try to reset the scene rotation
              if (modelViewer.model.scene && modelViewer.model.scene.rotation) {
                modelViewer.model.scene.rotation.set(0, 0, 0);
                console.log("Reset scene rotation in AR");
              }
              
              // Try to reset all children rotations
              if (modelViewer.model.scene && modelViewer.model.scene.children) {
                modelViewer.model.scene.children.forEach((child: any) => {
                  if (child.rotation) {
                    child.rotation.set(0, 0, 0);
                    console.log("Reset child rotation in AR");
                  }
                });
              }
            }
          } catch (e) {
            console.log("Could not force orientation:", e);
          }
        }, 1000);
      }
    });

    return () => {
      el.removeEventListener("camera-change", updateAxes);
      if (axesRef.current && container) {
        container.removeChild(axesRef.current);
        axesRef.current = null;
      }
      if (viewerRef.current && container) {
        container.removeChild(viewerRef.current);
        viewerRef.current = null;
      }
    };
  }, [src, alt, autoRotate, cameraControls, iosSrc, ar]);

  return <div ref={ref} className={className} style={style} />;
};

export default ModelViewerWrapper;
