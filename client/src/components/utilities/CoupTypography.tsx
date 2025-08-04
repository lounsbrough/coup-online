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
  if (onBack) {
    return (
      <Grid container alignItems="center" justifyContent="center">
        <IconButton
          onClick={() => { onBack() }}
          sx={backButtonSx}
        ><ArrowBack /></IconButton>
        <Typography
          {...props}
          sx={addTextShadow
            ? { ...props.sx, textShadow: '2px 2px 2px black' }
            : (props.sx ?? {})
          }
        >
          {children}
        </Typography>
        <IconButton
          sx={{ ...backButtonSx, visibility: 'hidden' }}
        ><ArrowBack /></IconButton>
      </Grid>
    )
  }

  return (
    <Typography
      {...props}
      sx={addTextShadow
        ? { ...props.sx, textShadow: '2px 2px 2px black' }
        : (props.sx ?? {})
      }
    >
      {children}
    </Typography>
  )
}

export default CoupTypography
