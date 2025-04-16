import { useState } from 'react'
import { Route, Routes, Link } from 'react-router'
import { Box, Button, Typography } from '@mui/material'
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
import UserSettings from './UserSettings'
import { WebSocketContextProvider } from '../contexts/WebSocketContext'
import Logo from './icons/Logo'
import { useTranslationContext } from '../contexts/TranslationsContext'
import ChatBubble from './chat/ChatBubble'
import { Chat, Gavel } from '@mui/icons-material'
import DualSideDrawer from './utilities/DualSideDrawer'
import ChatDrawerContent from './chat/ChatDrawerContent'
import RulesBubble from './rules/RulesBubble'
import RulesDrawerContent from './rules/RulesDrawerContent'

function App() {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [latestReadMessageId, setLatestReadMessageId] = useState<string | null>(null)
  const { t } = useTranslationContext()

  return (
    <div className="App">
      <WebSocketContextProvider>
        <GameStateContextProvider>
          <RulesBubble setRulesOpen={setLeftDrawerOpen} />
          <ChatBubble chatOpen={rightDrawerOpen} setChatOpen={setRightDrawerOpen} latestReadMessageId={latestReadMessageId} setLatestReadMessageId={setLatestReadMessageId} />
          <DualSideDrawer
            openLeft={leftDrawerOpen}
            openRight={rightDrawerOpen}
            setOpenLeft={setLeftDrawerOpen}
            setOpenRight={setRightDrawerOpen}
            leftDrawerContent={<RulesDrawerContent />}
            leftDrawerHeader={(
              <>
                <Gavel sx={{ mr: 1 }} />
                <span>{t('rules')}</span>
              </>
            )}
            rightDrawerContent={(
              <ChatDrawerContent
                setLatestReadMessageId={setLatestReadMessageId}
                chatOpen={rightDrawerOpen}
              />
            )}
            rightDrawerHeader={(
              <>
                <Chat sx={{ mr: 1 }} />
                <span>{t('chat')}</span>
              </>
            )}
          >
            <header className="App-header">
              <Box sx={{ whiteSpace: 'nowrap' }}>
                <Link to={'/'}>
                  <Button
                    size='large'
                    color='primary'
                    startIcon={<Logo height='32px' />}
                  >
                    <Typography component="span" sx={{
                      fontSize: '2rem'
                    }}
                    >
                      {t('title')}
                    </Typography>
                  </Button>
                </Link>
                <UserSettings />
              </Box>
            </header>
            <Routes>
              <Route path="/">
                <Route index element={<Home />} />
                <Route path="game" element={
                  <Game />
                } />
                <Route path="join-game" element={<JoinGame />} />
                <Route path="create-game" element={<CreateGame />} />
                <Route path="*" element={<Typography variant='h3' sx={{ mt: 10 }}>{t('pageNotFound')} 😱 - <Link to={'/'}>{t('home')}</Link></Typography>} />
              </Route>
            </Routes>
          </DualSideDrawer>
        </GameStateContextProvider>
      </WebSocketContextProvider>
    </div>
  )
}

export default App
