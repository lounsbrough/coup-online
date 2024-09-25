import { Influences } from "@shared/dist"
import Ambassador from "./Ambassador"
import Assassin from "./Assassin"
import Duke from "./Duke"
import Contessa from "./Contessa"
import Captain from "./Captain"
import { SvgIcon, SxProps } from "@mui/material"

const iconMap = {
  [Influences.Ambassador]: Ambassador,
  [Influences.Assassin]: Assassin,
  [Influences.Captain]: Captain,
  [Influences.Contessa]: Contessa,
  [Influences.Duke]: Duke
}

function InfluenceIcon({ influence, sx }: { influence: Influences, sx?: SxProps }) {
  const Icon = iconMap[influence]

  return (
    <SvgIcon sx={sx}>
      <Icon />
    </SvgIcon>
  )
}

export default InfluenceIcon
