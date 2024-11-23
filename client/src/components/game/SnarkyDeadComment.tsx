import { Typography } from "@mui/material"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function SnarkyDeadComment() {
  const { language } = useTranslationContext()

  const comments = {
    'en-US': [
      `Every loss is a learning opportunity.`,
      `You did the best you could.`,
      `Don't let this defeat you.`,
      `Don't worry, it's not your fault.`,
      `You're a natural at this whole losing thing.`,
      `Maybe you should try a different game.`,
      `I'm starting to think you're actually trying to lose.`,
      `You've perfected the skill of coming in last.`,
      `You're a true champion of failure.`,
      `You've managed to make losing look easy.`,
      `You're so bad, you're almost bad enough to be good.`,
      `I guess you'll have to stick to playing solitaire from now on.`,
      `You're a natural-born loser.`,
      `You're so good at losing, you should get a trophy.`,
      `You're the best at being the worst.`,
      `You've mastered the art of losing.`,
      `You're a walking, talking, losing machine.`,
      `You're the worst player I've ever seen.`
    ],
    'pt-BR': [
      `Cada perda é uma oportunidade de aprendizado.`,
      `Você fez o melhor que pôde.`,
      `Não deixe isso derrotar você.`,
      `Não se preocupe, não é sua culpa.`,
      `Você tem talento para toda essa coisa de perder.`,
      `Talvez você devesse tentar um jogo diferente.`,
      `Estou começando a pensar que você está realmente tentando perder.`,
      `Você aperfeiçoou a habilidade de chegar por último.`,
      `Você é um verdadeiro campeão do fracasso.`,
      `Você conseguiu fazer com que perder parecesse fácil.`,
      `Você é tão ruim, você é quase ruim o suficiente para ser bom.`,
      `Acho que você terá que continuar jogando paciência de agora em diante.`,
      `Você é um perdedor nato.`,
      `Você é tão bom em perder que deveria ganhar um troféu.`,
      `Você é o melhor em ser o pior.`,
      `Você dominou a arte de perder.`,
      `Você é uma máquina que anda, fala e perde.`,
      `Você é o pior jogador que já vi.`
    ]
  }[language]

  return (
    <>
      <Typography variant="h3">🪦</Typography>
      <Typography variant="h4">
        {comments[Math.floor(Math.random() * comments.length)]}
      </Typography>
    </>
  )
}

export default SnarkyDeadComment
