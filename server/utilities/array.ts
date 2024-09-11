export const shuffle = <T>(array: T[]): T[] => {
  const unShuffled = [...array]
  const shuffled: T[] = []

  while (unShuffled.length) {
    shuffled.push(unShuffled.splice(Math.floor(Math.random() * unShuffled.length), 1)[0])
  }

  return shuffled
}
