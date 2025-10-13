import { useEffect, useState } from "react"
import { AvailableLanguageCode } from '@shared'
import { useTranslationContext } from "../../contexts/TranslationsContext"
import Skull from "../icons/Skull"
import CoupTypography from '../utilities/CoupTypography'
import { snarkyDeadComments } from '../../i18n/translations'

const getRandomComment = (language: AvailableLanguageCode): string => {
  const commentsForLanguage = snarkyDeadComments[language]
  return commentsForLanguage[Math.floor(Math.random() * commentsForLanguage.length)]
}

function SnarkyDeadComment() {
  const [comment, setComment] = useState<string | null>(null)
  const { language } = useTranslationContext()

  useEffect(() => {
    setComment(getRandomComment(language))
    const interval = setInterval(() => {
      setComment(getRandomComment(language))
    }, 5000)
    return () => clearInterval(interval)
  }, [language])

  return (
    <>
      <CoupTypography variant="h3"><Skull fontSize="large" /></CoupTypography>
      <CoupTypography variant="h4" addTextShadow>{comment}</CoupTypography>
    </>
  )
}

export default SnarkyDeadComment
