import "./App.css";
import ModelViewerWrapper from "./components/ModelViewerWrapper";

function App() {
  return (
    <div
      style={{
        background: "linear-gradient(to right, #1e3c72, #2a5298)",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          position: "absolute",
          top: "10px",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        Novaland AR POC
      </header>
      <div
        style={{
          width: "80vw",
          height: "80vh",
          background: "white",
          borderRadius: "10px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <ModelViewerWrapper
          src="/models/ecommercestore.glb"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}

export default App;
