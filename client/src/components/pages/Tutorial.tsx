import { Box, Paper, Typography, Stepper, Step, StepLabel, StepContent, Button, useTheme } from '@mui/material'
import { useState } from 'react'
import { Actions, Influences } from '@shared'
import CoupTypography from '../utilities/CoupTypography'
import InfluenceIcon from '../icons/InfluenceIcon'
import { useTranslationContext } from '../../contexts/TranslationsContext'

interface TutorialProps {
  setRulesWiggle: (wiggle: boolean) => void
}

function Tutorial({ setRulesWiggle }: Readonly<TutorialProps>) {
  const { t } = useTranslationContext()
  const { influenceColors } = useTheme()
  const [activeStep, setActiveStep] = useState(0)

  const handleNext = () => {
    setActiveStep((prev) => {
      const next = prev + 1
      setRulesWiggle(next === steps.length)
      return next
    })
  }
  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
    setRulesWiggle(false)
  }
  const handleReset = () => {
    setActiveStep(0)
    setRulesWiggle(false)
  }

  const steps = [
    {
      label: t('tutorialStep1Title'),
      content: t('tutorialStep1Content'),
    },
    {
      label: t('tutorialStep2Title'),
      content: t('tutorialStep2Content'),
      highlight: (
        <Paper sx={{ p: 2, mt: 1 }}>
          <Typography color="white" sx={{ fontWeight: 'bold' }}>
            Alice: <InfluenceIcon influence={Influences.Duke} /> {t(Influences.Duke)} + <InfluenceIcon influence={Influences.Captain} /> {t(Influences.Captain)}
          </Typography>
          <Typography color="white" sx={{ fontWeight: 'bold' }}>
            Bob: <InfluenceIcon influence={Influences.Assassin} /> {t(Influences.Assassin)} + <InfluenceIcon influence={Influences.Contessa} /> {t(Influences.Contessa)}
          </Typography>
          <Typography color="white" sx={{ fontWeight: 'bold' }}>
            Carol: <InfluenceIcon influence={Influences.Ambassador} /> {t(Influences.Ambassador)} + <InfluenceIcon influence={Influences.Captain} /> {t(Influences.Captain)}
          </Typography>
          <Typography variant="body2" color="white" sx={{ mt: 1, display: 'block' }}>
            💰 {t('tutorialStartingCoins')}
          </Typography>
        </Paper>
      ),
    },
    {
      label: t('tutorialStep3Title'),
      content: t('tutorialStep3Content'),
      highlight: (
        <Paper sx={{ p: 2, mt: 1, background: influenceColors[Influences.Duke] }}>
          <Typography color="white">
            Alice: &quot;{t(Actions.Tax)}!&quot; → 💰 2 + 3 = 5
          </Typography>
        </Paper>
      ),
    },
    {
      label: t('tutorialStep4Title'),
      content: t('tutorialStep4Content'),
      highlight: (
        <Paper sx={{ p: 2, mt: 1, background: influenceColors[Influences.Captain] }}>
          <Typography color="white">
            Bob: &quot;{t(Actions.Steal)} {t('tutorialStep4Dialogue')}!&quot; → Bob 💰 2 + 2 = 4, Alice 💰 5 - 2 = 3
          </Typography>
        </Paper>
      ),
    },
    {
      label: t('tutorialStep5Title'),
      content: t('tutorialStep5Content'),
      highlight: (
        <Paper sx={{ p: 2, mt: 1, background: influenceColors[Influences.Captain] }}>
          <Typography color="white">
            Alice: &quot;{t('block')}! {t('tutorialStep5Block')} {t(Influences.Captain)}.&quot;
          </Typography>
          <Typography color="white" sx={{ mt: 1 }}>
            Bob: &quot;{t('tutorialStep5Ok')}&quot; → Bob 💰 2, Alice 💰 5
          </Typography>
        </Paper>
      ),
    },
    {
      label: t('tutorialStep6Title'),
      content: t('tutorialStep6Content'),
      highlight: (
        <Paper sx={{ p: 2, mt: 1, background: influenceColors[Influences.Assassin] }}>
          <Typography color="white">
            Bob: &quot;{t(Actions.Assassinate)} Carol!&quot; → Bob 💰 2 - 3 = -1... ❌
          </Typography>
          <Typography color="white" sx={{ mt: 1 }}>
            Bob: &quot;{t(Actions.Income)}&quot; → Bob 💰 2 + 1 = 3
          </Typography>
        </Paper>
      ),
    },
    {
      label: t('tutorialStep7Title'),
      content: t('tutorialStep7Content'),
      highlight: (
        <Paper sx={{ p: 2, mt: 1, background: influenceColors[Influences.Ambassador] }}>
          <Typography color="white">
            Carol: &quot;{t(Actions.Exchange)}!&quot; → {t('tutorialStep7Detail')}
          </Typography>
        </Paper>
      ),
    },
    {
      label: t('tutorialStep8Title'),
      content: t('tutorialStep8Content'),
      highlight: (
        <Paper sx={{ p: 2, mt: 1, background: influenceColors[Influences.Duke] }}>
          <Typography color="white">
            Alice: &quot;{t(Actions.Tax)}!&quot;
          </Typography>
          <Typography color="white" sx={{ mt: 1 }}>
            Carol: &quot;{t('challenge')}! {t('tutorialStep8Challenge')} {t(Influences.Duke)}!&quot;
          </Typography>
          <Typography color="white" sx={{ mt: 1 }}>
            Alice: *{t('tutorialStep8Reveal')}* → {t('tutorialStep8Result')}
          </Typography>
        </Paper>
      ),
    },
    {
      label: t('tutorialStep9Title'),
      content: t('tutorialStep9Content'),
      highlight: (
        <Paper sx={{ p: 2, mt: 1, background: influenceColors[Influences.Assassin] }}>
          <Typography color="white">
            Bob: &quot;{t(Actions.Assassinate)} Carol!&quot; → Bob 💰 4 - 3 = 1
          </Typography>
          <Typography color="white" sx={{ mt: 1 }}>
            Carol: 💀 {t('tutorialStep9Detail')}
          </Typography>
        </Paper>
      ),
    },
    {
      label: t('tutorialStep10Title'),
      content: t('tutorialStep10Content'),
    },
  ]

  return (
    <Box sx={{ mx: 'auto', mb: 15, maxWidth: 800, px: 3, py: 2 }}>
      <CoupTypography variant="h4" sx={{ mb: 3 }} addTextShadow>
        {t('tutorial')}
      </CoupTypography>
      <CoupTypography variant="body1" sx={{ mb: 4 }} addTextShadow>
        {t('tutorialIntro')}
      </CoupTypography>
      <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
        {steps.map((step, index) => (
          <Step key={index} completed={index < activeStep}>
            <StepLabel onClick={() => { setActiveStep(index); setRulesWiggle(false) }} sx={{ cursor: 'pointer' }}>
              <Typography sx={{ fontWeight: 'bold' }}>{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography sx={{ mb: 1 }}>{step.content}</Typography>
              {step.highlight}
              <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                {index > 0 && (
                  <Button variant="outlined" onClick={handleBack}>
                    {t('tutorialBack')}
                  </Button>
                )}
                <Button variant="contained" onClick={handleNext}>
                  {index === steps.length - 1 ? t('tutorialFinish') : t('tutorialNext')}
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <CoupTypography variant="h5" addTextShadow sx={{ mb: 2 }}>
            {t('tutorialComplete')}
          </CoupTypography>
          <Typography sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            {t('tutorialRulesHint')}
          </Typography>
          <Button variant="outlined" onClick={handleReset}>
            {t('tutorialRestart')}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Tutorial
