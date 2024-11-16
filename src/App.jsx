import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'
import Home from "./pages/Home";
import MainLayout from "./layouts/MainLayout";
import History from "./pages/History";


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
