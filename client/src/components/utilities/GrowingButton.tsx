import { Button, ButtonProps, Grow } from "@mui/material"
import { useState } from "react"

function GrowingButton({ ...props }: ButtonProps) {
  const [transitionDone, setTransitionDone] = useState(false)

  return (
    <Grow
      in
      timeout={1000}
      onTransitionEnd={() => { setTransitionDone(true) }}
    >
      <Button
        {...props}
        disabled={!(process.env.REACT_APP_DISABLE_TRANSITIONS || transitionDone) || !!props.disabled}
      >
        {props.children}
      </Button>
    </Grow>
  )
}

export default GrowingButton
