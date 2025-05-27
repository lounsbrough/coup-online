import { ArrowBack } from "@mui/icons-material"
import { Grid, IconButton, SxProps, Typography, TypographyProps } from "@mui/material"

const buttonSx: SxProps = { p: 1, my: -1, mx: 1 }

function TypographyWithBackButton({ children, onBack, ...props }: TypographyProps & {
  onBack: () => void
}) {
  return (
    <Grid container alignItems="center" justifyContent="center">
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
    </Grid>
  )
}

export default TypographyWithBackButton
