import { ArrowBack } from "@mui/icons-material"
import { Grid2, IconButton, SxProps, Typography, TypographyProps } from "@mui/material"

const buttonSx: SxProps = { p: 1, my: -1, mx: 1 }

function TypographyWithBackButton({ children, onBack, ...props }: TypographyProps & {
  onBack: () => void
}) {
  return (
    <Grid2 container alignItems="center">
      <IconButton
        onClick={() => { onBack() }}
        sx={buttonSx}
      ><ArrowBack /></IconButton>
      <Typography sx={{ ...props.sx }} {...props}>
        {children}
      </Typography>
      <IconButton
        sx={{ ...buttonSx, visibility: 'hidden' }}
      ><ArrowBack /></IconButton>
    </Grid2>
  )
}

export default TypographyWithBackButton
