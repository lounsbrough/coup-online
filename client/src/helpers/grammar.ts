import { Responses } from '@shared'

export const toTitleCase = (s: string) => {
  if (typeof s !== 'string') {
    return s
  }

  return s.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
  )
}

export const getPresentProgressiveResponse = (response: Responses) => ({
  [Responses.Pass]: 'Passing',
  [Responses.Block]: 'Blocking',
  [Responses.Challenge]: 'Challenging'
})[response]
