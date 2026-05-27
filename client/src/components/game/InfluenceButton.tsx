import { type ButtonProps } from "@mui/material"
import { Influences } from '@shared'
import { useTranslationContext } from "../../contexts/TranslationsContext"
import GrowingButton from "../utilities/GrowingButton"
import InfluenceIcon from "../icons/InfluenceIcon"

function InfluenceButton({ influence, children, ...props }: {
    influence: Influences
} & Omit<ButtonProps, 'color' | 'variant'>) {
    const { t } = useTranslationContext()

    return (
        <GrowingButton
            variant="contained"
            color={influence}
            startIcon={<InfluenceIcon influence={influence} />}
            {...props}
            sx={{ color: 'white', ...props.sx }}
        >
            {children ?? t(influence)}
        </GrowingButton>
    )
}

export default InfluenceButton
