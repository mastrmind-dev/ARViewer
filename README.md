# Novaland AR Viewer

A modern, attractive 3D model viewer with **real Augmented Reality capabilities** built with React, TypeScript, Three.js, and WebXR.

## 🚀 **Real AR Features (Not Just UI!)**

### 📱 **Actual AR Functionality**
- **WebXR Integration**: Real AR sessions using WebXR API
- **Camera Access**: Live camera feed with device camera
- **Hit Testing**: Real-world surface detection and model placement
- **AR Session Management**: Start/stop AR experiences
- **Device Compatibility**: Checks for AR support on user's device

### 🎯 **3D Model Viewer**
- **Interactive 3D Viewing**: Drag to rotate, scroll to zoom, right-click to pan
- **Lighting Controls**: Adjustable light intensity and ambient lighting
- **Environment Mapping**: Optional room lighting for realistic rendering
- **Model Information**: Display model details and reset view functionality

### 🎨 **Modern UI**
- **Glass Morphism**: Beautiful backdrop blur effects and transparency
- **Responsive Design**: Works seamlessly across all device sizes
- **Dark Theme**: Professional dark color scheme with accent colors
- **Smooth Animations**: CSS transitions and hover effects

## 🔧 **AR Technology Stack**

- **WebXR API**: Native AR support in modern browsers
- **React Three XR**: WebXR integration for React
- **Device Camera**: Real-time camera feed for AR experience
- **Hit Testing**: Surface detection for model placement
- **AR Session Management**: Full AR lifecycle control

## 🛣️ **Routes**

- **`/`** - Main 3D model viewer (desktop mode)
- **`/ar`** - **Real AR mode** with camera access and WebXR

## 🚀 **Getting Started**

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- **HTTPS required** for AR functionality (camera access)
- **AR-compatible device** (mobile/tablet with AR support)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 🔍 **AR Requirements**

### **Device Support**
- **iOS**: Safari 13+ with ARKit support
- **Android**: Chrome 79+ with ARCore support
- **Desktop**: Limited AR support (camera access only)

### **Browser Requirements**
- **HTTPS**: Required for camera and AR access
- **WebXR**: Must support WebXR API
- **Permissions**: Camera and AR permissions granted

## 🏗️ **Project Structure**

```
src/
├── App.tsx          # Main app with real AR routing
├── App.css          # Minimal app styles
├── ModernUI.css     # Modern UI + AR component styling
├── main.tsx         # App entry point
└── assets/          # Static assets
```

## 📱 **AR Usage Guide**

### **1. Access AR Mode**
- Navigate to `/ar` route
- Grant camera permissions when prompted

### **2. Start AR Experience**
- Click "🚀 Start AR Experience" button
- Wait for AR session to initialize
- Point device at flat surface

### **3. Place 3D Model**
- Surface detection will show placement guide
- Tap to place the model in AR space
- Move around to view from different angles

### **4. AR Controls**
- **Lighting**: Adjust model lighting in real-time
- **Environment**: Toggle room lighting effects
- **Session**: Start/stop AR experience

## 🔧 **AR Technical Features**

### **WebXR Integration**
```typescript
// Real AR session management
const session = await navigator.xr!.requestSession('immersive-ar', {
  requiredFeatures: ['hit-test', 'dom-overlay'],
  domOverlay: { root: document.getElementById('ar-overlay') }
});
```

### **Camera Access**
```typescript
// Real device camera feed
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment', // Back camera
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
});
```

### **Hit Testing**
```typescript
// Real-world surface detection
useHitTest((hitMatrix) => {
  if (modelRef.current && !modelPlaced) {
    hitMatrix.decompose(
      modelRef.current.position,
      modelRef.current.quaternion,
      modelRef.current.scale
    );
    setModelPlaced(true);
  }
});
```

## 🌐 **Browser Support**

### **AR Support**
- **Chrome Mobile**: Full AR support with ARCore
- **Safari iOS**: Full AR support with ARKit
- **Firefox Mobile**: Limited AR support
- **Desktop Browsers**: Camera access only

### **Fallback Support**
- **No AR Support**: Falls back to camera feed
- **No Camera**: Shows placeholder with instructions
- **No WebXR**: Displays compatibility message

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Camera Not Working**: Check HTTPS and permissions
2. **AR Not Starting**: Verify device AR support
3. **Model Not Placing**: Ensure flat surface detection
4. **Performance Issues**: Close other AR apps

### **Debug Mode**
- Check browser console for AR session logs
- Verify WebXR support in browser
- Test camera permissions manually

## 📄 **License**

© 2024 Novaland. All rights reserved.

## 🆘 **Support**

For AR functionality issues:
1. Check device compatibility
2. Verify browser support
3. Ensure HTTPS connection
4. Grant necessary permissions

---

**Note**: This is a real AR implementation, not just a UI wrapper. It uses WebXR API, device cameras, and actual AR session management for authentic augmented reality experiences.
