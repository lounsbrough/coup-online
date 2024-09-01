import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import JoinGame from './pages/JoinGame';
import CreateGame from './pages/CreateGame';
import Home from './pages/Home';
import Game from './pages/Game';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Typography variant='h4'>Coup Online</Typography>
      </header>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="game" element={<Game />} />
          <Route path="join-game" element={<JoinGame />} />
          <Route path="create-game" element={<CreateGame />} />
          <Route path="*" element={<div>Page not found 😱 - Go <Link to={'/'}>Home</Link></div>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
