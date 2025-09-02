// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // import your CSS

function App() {
  return (
    <div>
      <h1>Hello, world!</h1>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
