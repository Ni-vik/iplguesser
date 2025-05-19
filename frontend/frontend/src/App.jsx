import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import React from 'react';
import Room from './pages/Rooms';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/rooms' element={<Room/>} />
      </Routes>
    </Router>
  );
}

export default App;
