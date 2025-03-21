import Fab from '@mui/material/Fab'
import ChatIcon from '@mui/icons-material/Chat'

interface ChatBubbleProps {
  openChatDialog: () => void;
}

export default function ChatBubble({ openChatDialog }: ChatBubbleProps) {
  return (
    <Fab
      onClick={openChatDialog}
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
