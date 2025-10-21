import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Nav from "./Components/Nav/Nav.jsx";
import Upload_Images from "./Components/Upload_Images/UploadPage.jsx";
import Dashboard from "./Components/Dashboard/Dashboard.jsx";
import Stats from "./Components/Stats/Stats.jsx";
import SearchForm from "./Components/Search_Image/SearchForm.jsx";
import UploadForm from "./Components/Upload_Images/UploadForm.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Nav></Nav>
      <Routes>
        <Route path="*" element={<Dashboard />} />
        <Route path="app/upload" element={<Upload_Images></Upload_Images>} />
        <Route path="app/search" element={<Upload_Images></Upload_Images>} />
        <Route path="app/stats" element={<Stats />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
