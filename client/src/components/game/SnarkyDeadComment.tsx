import { useEffect, useState } from "react"
import { AvailableLanguageCode } from '@shared'
import { useTranslationContext } from "../../contexts/TranslationsContext"
import Skull from "../icons/Skull"
import CoupTypography from '../utilities/CoupTypography'

const comments = {
  'de-DE': [
    `Jede Niederlage ist eine Lernmöglichkeit.`,
    `Du hast dein Bestes gegeben.`,
    `Lass dich davon nicht unterkriegen.`,
    `Keine Sorge, es ist nicht deine Schuld.`,
    `Du bist ein Naturtalent im Verlieren.`,
    `Vielleicht solltest du ein anderes Spiel ausprobieren.`,
    `Ich glaube langsam, du versuchst wirklich zu verlieren.`,
    `Du hast die Fähigkeit perfektioniert, als Letzter anzukommen.`,
    `Du bist ein wahrer Meister des Scheiterns.`,
    `Du hast es geschafft, Verlieren einfach aussehen zu lassen.`,
    `Du bist so schlecht, dass du schon fast wieder gut bist.`,
    `Ich schätze, du wirst von nun an nur noch Solitaire spielen können.`,
    `Du bist ein geborener Verlierer.`,
    `Du bist so gut im Verlieren, du solltest eine Trophäe bekommen.`,
    `Du bist der Beste im Schlechtesten sein.`,
    `Du hast die Kunst des Verlierens gemeistert.`,
    `Du bist eine wandelnde, sprechende Verlierermaschine.`,
    `Du bist der schlechteste Spieler, den ich je gesehen habe.`
  ],
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
  'es-MX': [
    `Cada pérdida es una oportunidad para aprender.`,
    `Hiciste lo mejor que pudiste.`,
    `No dejes que esto te derrote.`,
    `No te preocupes, no es tu culpa.`,
    `Eres un natural en todo esto de perder.`,
    `Quizás deberías intentar un juego diferente.`,
    `Estoy empezando a pensar que realmente estás tratando de perder.`,
    `Has perfeccionado la habilidad de llegar al último lugar.`,
    `Eres un verdadero campeón del fracaso.`,
    `Has logrado que perder parezca fácil.`,
    `Eres tan malo que casi eres lo suficientemente malo como para ser bueno.`,
    `Supongo que tendrás que seguir jugando solitario de ahora en adelante.`,
    `Eres un perdedor nato.`,
    `Eres tan bueno perdiendo que deberías obtener un trofeo.`,
    `Eres el mejor en ser el peor.`,
    `Has dominado el arte de perder.`,
    `Eres una máquina de perder andante y parlante.`,
    `Eres el peor jugador que he visto en mi vida.`
  ],
  'fr-FR': [
    `Chaque perte est une opportunité d'apprendre.`,
    `Tu as fait de ton mieux.`,
    `Ne te laisse pas abattre par ça.`,
    `Ne t'inquiète pas, ce n'est pas de ta faute.`,
    `Tu es doué pour cette histoire de perdre.`,
    `Peut-être devrais-tu essayer un jeu différent.`,
    `Je commence à croire que tu essaies vraiment de perdre.`,
    `Tu as perfectionné l'art d'arriver dernier.`,
    `Tu es un vrai champion de l'échec.`,
    `Tu as réussi à faire en sorte que perdre ait l'air facile.`,
    `Tu es tellement mauvais que tu en deviens presque bon.`,
    `Je suppose qu'il va falloir que tu t'en tiennes au solitaire désormais.`,
    `Tu es un perdant né.`,
    `Tu es tellement bon pour perdre que tu devrais avoir un trophée.`,
    `Tu es le meilleur pour être le pire.`,
    `Tu as maîtrisé l'art de perdre.`,
    `Tu es une machine à perdre ambulante et parlante.`,
    `Tu es le pire joueur que j'aie jamais vu.`
  ],
  'hi-IN': [
    `हर हार एक सीखने का अवसर है।`,
    `आपने अपनी पूरी कोशिश की।`,
    `इससे आपको निराश नहीं होना चाहिए।`,
    `चिंता मत करो, यह आपकी गलती नहीं है।`,
    `आप हारने में स्वाभाविक हैं।`,
    `शायद आपको कोई और खेल आजमाना चाहिए।`,
    `मैं सोचने लगा हूँ कि आप सच में हारने की कोशिश कर रहे हैं।`,
    `आपने अंतिम स्थान पर पहुँचने की कला को परिपूर्ण कर लिया है।`,
    `आप असफलता के सच्चे चैंपियन हैं।`,
    `आपने हारने को आसान बना दिया है।`,
    `आप इतने खराब हैं कि आप लगभग अच्छे हैं।`,
    `मुझे लगता है कि आपको अब से केवल सोलिटेयर खेलना होगा।`,
    `आप जन्मजात हारने वाले हैं।`,
    `आप हारने में इतने अच्छे हैं कि आपको एक ट्रॉफी मिलनी चाहिए।`,
    `आप सबसे खराब होने में सबसे अच्छे हैं।`,
    `आपने हारने की कला में महारत हासिल कर ली है।`,
    `आप एक चलती-फिरती हारने की मशीन हैं।`,
    `आप सबसे खराब खिलाड़ी हैं जिसे मैंने कभी देखा है।`
  ],
  'it-IT': [
    `Ogni sconfitta è un'opportunità per imparare.`,
    `Hai fatto del tuo meglio.`,
    `Non lasciarti abbattere da questo.`,
    `Non preoccuparti, non è colpa tua.`,
    `Sei un talento naturale in questa cosa del perdere.`,
    `Forse dovresti provare un gioco diverso.`,
    `Comincio a pensare che tu stia davvero cercando di perdere.`,
    `Hai perfezionato l'abilità di arrivare ultimo.`,
    `Sei un vero campione del fallimento.`,
    `Sei riuscito a far sembrare facile perdere.`,
    `Sei così scarso che sei quasi abbastanza scarso da essere bravo.`,
    `Immagino che d'ora in poi dovrai limitarti a giocare a solitario.`,
    `Sei un perdente nato.`,
    `Sei così bravo a perdere che dovresti ricevere un trofeo.`,
    `Sei il migliore nell'essere il peggiore.`,
    `HaiMasterizzato l'arte di perdere.`,
    `Sei una macchina per perdere che cammina e parla.`,
    `Sei il peggior giocatore che abbia mai visto.`
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
  ],
}

const getRandomComment = (language: AvailableLanguageCode): string => {
  const commentsForLanguage = comments[language]
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
