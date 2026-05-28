import { Box, type ButtonProps } from "@mui/material"
import { Influences } from '@shared'
import { useTranslationContext } from "../../contexts/TranslationsContext"
import GrowingButton from "../utilities/GrowingButton"
import InfluenceIcon from "../icons/InfluenceIcon"

function InfluenceButton({ influence, children, startIcon, ...props }: {
    influence: Influences
    startIcon?: React.ReactNode
} & Omit<ButtonProps, 'color' | 'variant' | 'startIcon'>) {
    const { t } = useTranslationContext()

    return (
        <GrowingButton
            variant="contained"
            color={influence}
            startIcon={<Box sx={{ display: 'flex', alignItems: 'center' }}>{startIcon}<InfluenceIcon influence={influence} /></Box>}
            {...props}
            sx={[{ color: 'white' }, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}
        >
            {children ?? t(influence)}
        </GrowingButton>
    )
}

export default InfluenceButton
