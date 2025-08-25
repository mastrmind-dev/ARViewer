import "@google/model-viewer";
import ModelViewer from "./wrappers/ModelViewer";

const ARViewer = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ModelViewer
        // src="/models/ecommercestore.glb"
        src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
        alt="A 3D model of an e-commerce store"
        ar
        ar-modes="scene-viewer webxr quick-look"
        ar-scale="fixed"
        camera-controls
        // auto-rotate={false}
        shadow-intensity="1"
        style={{ width: "100%", height: "100%" }}
        // orientation="0 300 0 0"
      />
    </div>
  );
};

export default ARViewer;
