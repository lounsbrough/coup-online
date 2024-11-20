import { MenuItem, Select } from "@mui/material"
import { SelectChangeEvent } from '@mui/material/Select'
import availableLanguages, { AvailableLanguageCode } from "../i18n/availableLanguages"
import { useTranslationContext } from "../contexts/TranslationsContext"

function LanguageSelector() {
  const { language, setLanguage } = useTranslationContext()

  const handleChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as AvailableLanguageCode)
  }

  return (
    <Select
      size="small"
      value={language}
      onChange={handleChange}
    >
      {availableLanguages.map(({ code, flag, name }) =>
        <MenuItem key={code} value={code}>{name} {flag}</MenuItem>)}
    </Select>
  )
}

export default LanguageSelector
