import { Typography } from "@mui/material"

function BetaTag() {
  return (
    <Typography
      component="span"
      variant="inherit"
      sx={{
        fontStyle: 'italic',
        fontSize: 'smaller'
      }}
    >
      &nbsp;— Beta
    </Typography>
  )
}

export default BetaTag
