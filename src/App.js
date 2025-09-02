import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MoodCalculator from "./components/MoodCalculator";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MoodCalculator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;