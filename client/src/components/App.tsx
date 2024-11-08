import { Route, Routes, Link } from 'react-router-dom'
import { Button, Typography } from '@mui/material'
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
import Logo from './icons/Logo'

function App() {
  return (
    <div className="App">
      <MaterialThemeContextProvider>
        <WebSocketContextProvider>
          <header className="App-header">
            <Rules />
            <Link to={'/'}>
              <Button
                size='large'
                color='primary'
                startIcon={<Logo height='32px' />}
              >
                <Typography component="span" sx={{
                  fontSize: "32px"
                }}
                >
                  Coup
                </Typography>
              </Button>
            </Link>
            <UserSettings />
          </header>
          <Routes>
            <Route path="/">
              <Route index element={<Home />} />
              <Route path="game" element={
                <GameStateContextProvider>
                  <Game />
                </GameStateContextProvider>
              } />
              <Route path="join-game" element={<JoinGame />} />
              <Route path="create-game" element={<CreateGame />} />
              <Route path="*" element={<Typography variant='h3' sx={{ mt: 10 }}>Page not found 😱 - Go <Link to={'/'}>Home</Link></Typography>} />
            </Route>
          </Routes>
        </WebSocketContextProvider>
      </MaterialThemeContextProvider>
    </div>
  )
}

export default App
