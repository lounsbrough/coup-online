import { useState } from 'react'
import { Button, ButtonProps, Grow } from '@mui/material'

function GrowingButton({ ...props }: ButtonProps) {
  const [transitionDone, setTransitionDone] = useState(false)

  return (
    <Grow
      in
      timeout={1000}
      onTransitionEnd={() => {
        setTransitionDone(true)
      }}
    >
      <Button
        {...props}
        disabled={
          !(import.meta.env.VITE_DISABLE_TRANSITIONS || transitionDone) ||
          !!props.disabled
        }
      >
        {props.children}
      </Button>
    </Grow>
  )
}

export default GrowingButton
