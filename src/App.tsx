import {
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Box3, Vector3, Group } from "three";
import "./App.css";
import "./ModernUI.css";

function ModelViewer() {
  const { scene } = useGLTF("/models/ecommercestore.glb");

  useEffect(() => {
    if (!scene) return;

    // compute bounding box to auto-scale and center the model
    const bbox = new Box3().setFromObject(scene);
    const size = new Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    // if model is extremely small or large, normalize to a desired size (2 units)
    const desiredSize = 2; // adjust as needed
    const uniformScale = maxDim > 0 ? desiredSize / maxDim : 1;
    scene.scale.setScalar(uniformScale);

    // recenter the model at world origin after scaling
    const center = new Vector3();
    bbox.getCenter(center);
    scene.position.set(
      -center.x * uniformScale,
      -center.y * uniformScale,
      -center.z * uniformScale
    );

    // apply a slight rotation for presentation
    scene.rotation.set(Math.PI / 4, 0, 0);

    scene.matrixAutoUpdate = true;
  }, [scene]);

  return <primitive object={scene} />;
}

// AR Model Component with Camera Integration
function ARModel() {
  const { scene } = useGLTF("/models/ecommercestore.glb");
  const modelRef = useRef<Group>(null);
  const [modelPlaced, setModelPlaced] = useState(false);
  const [placementPosition] = useState(new Vector3(0, 0, -2));

  useEffect(() => {
    if (!scene) return;

    // Auto-scale the model for AR
    const bbox = new Box3().setFromObject(scene);
    const size = new Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    const desiredSize = 1; // Smaller for AR
    const uniformScale = maxDim > 0 ? desiredSize / maxDim : 1;
    scene.scale.setScalar(uniformScale);

    // Center the model
    const center = new Vector3();
    bbox.getCenter(center);
    scene.position.set(
      -center.x * uniformScale,
      -center.y * uniformScale,
      -center.z * uniformScale
    );

    scene.matrixAutoUpdate = true;
  }, [scene]);

  // Handle model placement on click
  const handleModelClick = () => {
    if (modelRef.current) {
      // Place model at a fixed position for now
      modelRef.current.position.set(0, 0, -2);
      setModelPlaced(true);
    }
  };

  return (
    <>
      {/* AR Model */}
      <group 
        ref={modelRef} 
        position={placementPosition}
        onClick={handleModelClick}
      >
        <primitive object={scene} />
      </group>

      {/* Placement Guide */}
      {!modelPlaced && (
        <mesh
          position={[0, -1, -2]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handleModelClick}
        >
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial color={0x00ff00} transparent opacity={0.3} />
        </mesh>
      )}
    </>
  );
}

// AR Session Manager
function ARSessionManager() {
  const [arSupported, setArSupported] = useState(false);
  const [arSession, setArSession] = useState<XRSession | null>(null);
  const [arError, setArError] = useState<string | null>(null);

  useEffect(() => {
    // Check WebXR AR support
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
        setArSupported(supported);
        if (!supported) {
          setArError('AR not supported on this device');
        }
      }).catch(() => {
        setArError('AR not supported on this device');
      });
    } else {
      setArError('WebXR not supported on this device');
    }
  }, []);

  const startARSession = async () => {
    try {
      if (!arSupported) {
        setArError('AR not supported');
        return;
      }

      const session = await navigator.xr!.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
      });

      setArSession(session);
      setArError(null);

      session.addEventListener('end', () => {
        setArSession(null);
      });

    } catch (error) {
      setArError(`Failed to start AR session: ${error}`);
    }
  };

  const stopARSession = () => {
    if (arSession) {
      arSession.end();
    }
  };

  return (
    <div className="ar-session-manager">
      <div className="ar-status">
        <div className="status-indicator">
          <span className={`status-dot ${arSupported ? 'success' : 'error'}`}></span>
          <span>{arSupported ? 'AR Ready' : 'AR Not Supported'}</span>
        </div>
        
        {arError && (
          <div className="ar-error">
            <span>⚠️ {arError}</span>
          </div>
        )}

        {arSupported && (
          <div className="ar-controls">
            {!arSession ? (
              <button 
                className="btn primary ar-btn"
                onClick={startARSession}
              >
                🚀 Start AR Experience
              </button>
            ) : (
              <button 
                className="btn danger ar-btn"
                onClick={stopARSession}
              >
                ⏹️ Stop AR
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// AR Camera Feed Component
function ARCameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setCameraError(null);
        }
      } catch (error) {
        setCameraError('Camera access denied or not available');
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="ar-camera-feed">
      {cameraActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
      ) : (
        <div className="camera-placeholder">
          <span>📱</span>
          <p>Camera not available</p>
        </div>
      )}
      
      {cameraError && (
        <div className="camera-error">
          <span>⚠️ {cameraError}</span>
        </div>
      )}
    </div>
  );
}

function ControlPanel({ 
  lightIntensity, 
  setLightIntensity, 
  ambientIntensity, 
  setAmbientIntensity, 
  showEnv, 
  setShowEnv
}: {
  lightIntensity: number;
  setLightIntensity: (value: number) => void;
  ambientIntensity: number;
  setAmbientIntensity: (value: number) => void;
  showEnv: boolean;
  setShowEnv: (value: boolean) => void;
}) {
  return (
    <div className="control-panel">
      <div className="panel-header">
        <div className="panel-icon">⚙️</div>
        <h3>Scene Controls</h3>
      </div>
      
      <div className="control-group">
        <label className="control-label">
          <span>Light Intensity</span>
          <span className="value-display">{lightIntensity.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0"
          max="3"
          step="0.05"
          value={lightIntensity}
          onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label className="control-label">
          <span>Ambient Light</span>
          <span className="value-display">{ambientIntensity.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={ambientIntensity}
          onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showEnv}
            onChange={(e) => setShowEnv(e.target.checked)}
            className="checkbox"
          />
          <span className="checkmark"></span>
          <span>Use Room Lighting</span>
        </label>
      </div>

      <div className="model-info">
        <div className="info-header">
          <h4>Model Information</h4>
          <div className="model-badge">3D</div>
        </div>
        <p className="model-name">ecommercestore.glb</p>
        <button className="btn primary">Reset View</button>
      </div>
    </div>
  );
}

function MainViewer() {
  const [lightIntensity, setLightIntensity] = useState(1.2);
  const [ambientIntensity, setAmbientIntensity] = useState(0.4);
  const [showEnv, setShowEnv] = useState(false);

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand-section">
          <div className="brand-logo">🏢</div>
          <div className="brand-text">
            <h1 className="brand-title">Novaland</h1>
            <p className="brand-subtitle">AR Viewer & 3D Experience</p>
          </div>
        </div>
        
        <nav className="nav">
          <Link to="/" className="nav-btn active">
            <span className="nav-icon">🎯</span>
            <span>Viewer</span>
          </Link>
          <Link to="/ar" className="nav-btn">
            <span className="nav-icon">📱</span>
            <span>AR View</span>
          </Link>
          <button className="nav-btn">
            <span className="nav-icon">📊</span>
            <span>Analytics</span>
          </button>
          <button className="nav-btn">
            <span className="nav-icon">⚡</span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="user-section">
          <button className="user-btn">
            <span className="user-avatar">👤</span>
          </button>
        </div>
      </header>

      <div className="content">
        <section className="viewer-column">
          <div className="viewer-header">
            <div className="viewer-title">
              <h2>3D Model Viewer</h2>
              <p>Explore your 3D models in real-time</p>
            </div>
            <div className="viewer-actions">
              <Link to="/ar" className="action-btn">
                <span>📱</span>
                <span>View in AR</span>
              </Link>
              <button className="action-btn">
                <span>📥</span>
                <span>Export</span>
              </button>
              <button className="action-btn">
                <span>💾</span>
                <span>Save</span>
              </button>
            </div>
          </div>

          <div className="viewer-canvas">
            <Canvas camera={{ position: [0, 1.8, 4], fov: 60 }}>
              <ambientLight intensity={ambientIntensity} />
              <directionalLight
                position={[5, 10, 5]}
                intensity={lightIntensity}
              />
              {showEnv && <Environment preset="apartment" />}
              <ModelViewer />
              <OrbitControls enablePan={true} enableZoom={true} />
            </Canvas>

            <div className="canvas-overlay">
              <div className="overlay-left">
                <div className="status-badge">
                  <div className="status-dot active"></div>
                  <span>Live Preview</span>
                </div>
                <div className="hint">
                  Drag to rotate, scroll to zoom, right-click to pan.
                </div>
              </div>

              <div className="overlay-right">
                <div className="quick-stats">
                  <div className="stat-item">
                    <span className="stat-label">FPS</span>
                    <span className="stat-value">60</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Polygons</span>
                    <span className="stat-value">12.5K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="panel-column">
          <ControlPanel
            lightIntensity={lightIntensity}
            setLightIntensity={setLightIntensity}
            ambientIntensity={ambientIntensity}
            setAmbientIntensity={setAmbientIntensity}
            showEnv={showEnv}
            setShowEnv={setShowEnv}
          />
        </aside>
      </div>

      <footer className="footbar">
        <div className="footer-content">
          <div className="footer-left">
            <span>Powered by React Three Fiber</span>
          </div>
          <div className="footer-right">
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>© 2024 Novaland</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ARView() {
  const [lightIntensity, setLightIntensity] = useState(1.2);
  const [ambientIntensity, setAmbientIntensity] = useState(0.4);
  const [showEnv, setShowEnv] = useState(false);

  return (
    <div className="app-root ar-mode">
      <header className="topbar">
        <div className="brand-section">
          <div className="brand-logo">📱</div>
          <div className="brand-text">
            <h1 className="brand-title">Novaland</h1>
            <p className="brand-subtitle">AR Experience</p>
          </div>
        </div>
        
        <nav className="nav">
          <Link to="/" className="nav-btn">
            <span className="nav-icon">🎯</span>
            <span>Viewer</span>
          </Link>
          <Link to="/ar" className="nav-btn active">
            <span className="nav-icon">📱</span>
            <span>AR View</span>
          </Link>
        </nav>

        <div className="user-section">
          <button className="user-btn">
            <span className="user-avatar">👤</span>
          </button>
        </div>
      </header>

      <div className="content ar-content">
        <section className="viewer-column">
          <div className="viewer-header">
            <div className="viewer-title">
              <h2>AR Model Viewer</h2>
              <p>Experience your 3D models in Augmented Reality</p>
            </div>
            <div className="viewer-actions">
              <Link to="/" className="action-btn">
                <span>🖥️</span>
                <span>Desktop View</span>
              </Link>
              <button className="action-btn">
                <span>📱</span>
                <span>Share AR</span>
              </button>
            </div>
          </div>

          {/* AR Session Manager */}
          <ARSessionManager />

          {/* AR Camera Feed */}
          <div className="ar-camera-container">
            <ARCameraFeed />
          </div>

          {/* AR Canvas */}
          <div className="viewer-canvas ar-canvas">
            <Canvas camera={{ position: [0, 1.8, 4], fov: 60 }}>
              <ambientLight intensity={ambientIntensity} />
              <directionalLight
                position={[5, 10, 5]}
                intensity={lightIntensity}
              />
              {showEnv && <Environment preset="apartment" />}
              <ARModel />
              <OrbitControls enablePan={true} enableZoom={true} />
            </Canvas>

            <div className="canvas-overlay">
              <div className="overlay-left">
                <div className="status-badge ar-status">
                  <div className="status-dot active"></div>
                  <span>AR Mode Active</span>
                </div>
                <div className="hint">
                  Click on the green plane to place the model.
                </div>
              </div>

              <div className="overlay-right">
                <div className="quick-stats">
                  <div className="stat-item">
                    <span className="stat-label">AR</span>
                    <span className="stat-value">ON</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Camera</span>
                    <span className="stat-value">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AR Instructions */}
          <div className="ar-instructions">
            <h4>AR Instructions</h4>
            <p>1. Grant camera permissions when prompted</p>
            <p>2. View the live camera feed above</p>
            <p>3. Click on the green plane to place the 3D model</p>
            <p>4. Use mouse/touch to interact with the placed model</p>
          </div>
        </section>

        <aside className="panel-column">
          <ControlPanel
            lightIntensity={lightIntensity}
            setLightIntensity={setLightIntensity}
            ambientIntensity={ambientIntensity}
            setAmbientIntensity={setAmbientIntensity}
            showEnv={showEnv}
            setShowEnv={setShowEnv}
          />
        </aside>
      </div>

      <footer className="footbar">
        <div className="footer-content">
          <div className="footer-left">
            <span>Powered by React Three Fiber + Camera AR</span>
          </div>
          <div className="footer-right">
            <span>AR Mode</span>
            <span>•</span>
            <span>© 2024 Novaland</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainViewer />} />
        <Route path="/ar" element={<ARView />} />
      </Routes>
    </Router>
  );
}
