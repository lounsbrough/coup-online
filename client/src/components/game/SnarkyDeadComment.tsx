import { Typography } from "@mui/material";

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
    `You're a true champion of failure.`,
    `I'm impressed. You've managed to make losing look easy.`,
    `You're so good, you're almost bad enough to be good.`,
    `I'm starting to think you're just unlucky. Or maybe you're cursed.`,
    `You're the king of losing. Or maybe the queen of losing. Or the jester of losing.`,
    `You're a natural-born loser.`,
    `You're so good at losing, you should get a trophy.`,
    `You're the best at being the worst.`,
    `You're so good at losing, you should start your own losing streak.`,
    `You're a walking, talking, losing machine.`,
    `You're the worst player I've ever seen.`,
  ]

  return (
    <>
      <Typography sx={{ fontSize: '36px' }}>🪦</Typography>
      <Typography sx={{ fontSize: '24px' }}>
        {comments[Math.floor(Math.random() * comments.length)]}
      </Typography>
    </>
  );
}

export default SnarkyDeadComment;
