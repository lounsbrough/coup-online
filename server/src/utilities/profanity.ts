import { Filter } from 'glin-profanity'

const filter = new Filter({
  languages: [
    'english',
    'french',
    'german',
    'spanish',
    'italian',
    'portuguese',
    'hindi',
  ],
  detectLeetspeak: true
})

export const containsProfanity = (text: string): boolean => {
  return filter.isProfane(text)
}
