export const randomlyDecideToNotUseOwnedInfluence = () =>
  Math.random() < 0.05

export const randomlyDecideToBluff = (bluffMargin: number) =>
  Math.random() < bluffMargin
