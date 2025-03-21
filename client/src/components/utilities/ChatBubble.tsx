import Fab from '@mui/material/Fab'
import ChatIcon from '@mui/icons-material/Chat'

function ChatBubble() {
  return (
    <Fab
      sx={{ mr: 3, mb: 3 }}
      color="primary"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0
      }}
    >
      <ChatIcon />
    </Fab>
  )
}

export default ChatBubble
