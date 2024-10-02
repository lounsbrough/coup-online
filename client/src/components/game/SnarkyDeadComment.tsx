import { Typography } from "@mui/material"

function SnarkyDeadComment() {
  const comments = [
    `Every loss is a learning opportunity.`,
    `You did the best you could.`,
    `Don't let this defeat you.`,
    `Maybe next time you'll be the one laughing.`,
    `Don't worry, it's not your fault.`,
    `You're a natural at this whole losing thing.`,
    `Maybe you should try a different game. Or a different planet.`,
    `I'm starting to think you're actually trying to lose.`,
    `You've perfected the skill of coming in last.`,
    `You're a true champion of failure.`,
    `You've managed to make losing look easy.`,
    `You're so good, you're almost bad enough to be good.`,
    `I guess you'll have to stick to playing solitaire from now on.`,
    `You're a natural-born loser.`,
    `You're so good at losing, you should get a trophy.`,
    `You're the best at being the worst.`,
    `You've mastered the art of losing.`,
    `You're a walking, talking, losing machine.`,
    `You're the worst player I've ever seen.`,
  ]

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
