import { Shield, ThumbDown, ThumbUp } from "@mui/icons-material"
import { Responses } from "@shared"

const getResponseIcon = (response: Responses) => ({
  [Responses.Block]: Shield,
  [Responses.Challenge]: ThumbDown,
  [Responses.Pass]: ThumbUp,
})[response]

export default getResponseIcon
