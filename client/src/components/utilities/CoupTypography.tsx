import { ArrowBack } from "@mui/icons-material"
import { Grid, IconButton, SxProps, Typography, TypographyProps } from "@mui/material"

const backButtonSx: SxProps = { p: 1, my: -1, mx: 1 }

function CoupTypography({
  children,
  onBack,
  addTextShadow,
  ...props
}: TypographyProps & {
  onBack?: () => void
  addTextShadow?: boolean
}) {
  const styledTypography = (
    <Typography
      {...props}
      sx={addTextShadow
        ? { ...props.sx, textShadow: '2px 2px 2px black' }
        : (props.sx ?? {})}
    >
      {children}
    </Typography>
  )

  if (onBack) {
    return (
      <Grid container alignItems="center" justifyContent="center">
        <IconButton
          onClick={() => { onBack() }}
          sx={backButtonSx}
        ><ArrowBack /></IconButton>
        {styledTypography}
        <IconButton
          sx={{ ...backButtonSx, visibility: 'hidden' }}
        ><ArrowBack /></IconButton>
      </Grid>
    )
  }

  return styledTypography
}

export default CoupTypography
