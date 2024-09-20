import { Route, Routes } from 'react-router-dom'
import { Link, Typography } from '@mui/material'
import JoinGame from './pages/JoinGame'
import CreateGame from './pages/CreateGame'
import Home from './pages/Home'
import Game from './pages/Game'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './App.css'
import { GameStateContextProvider } from '../contexts/GameStateContext'
import { MaterialThemeContextProvider } from '../contexts/MaterialThemeContext'
import Rules from './Rules'
import UserSettings from './UserSettings'
import { WebSocketContextProvider } from '../contexts/WebSocketContext'

function App() {
  return (
    <div className="App">
      <MaterialThemeContextProvider>
        <WebSocketContextProvider>
          <GameStateContextProvider>
            <header className="App-header">
              <Rules />
              <Link color='primary'
                href={'/'}
              ><Typography variant="h4" style={{
                fontWeight: 500
              }}>Coup</Typography></Link>
              <UserSettings />
            </header>
            <Routes>
              <Route path="/">
                <Route index element={<Home />} />
                <Route path="game" element={<Game />} />
                <Route path="join-game" element={<JoinGame />} />
                <Route path="create-game" element={<CreateGame />} />
                <Route path="*" element={<div>Page not found 😱 - Go <Link href={'/'}>Home</Link></div>} />
              </Route>
            </Routes>
          </GameStateContextProvider>
        </WebSocketContextProvider>
      </MaterialThemeContextProvider>
    </div>
  )
}

export default App
