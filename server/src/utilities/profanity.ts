import { Filter } from 'glin-profanity'

const allowedNamePatterns = [
  /^mama(?:\s*🧸)?$/iu,
]

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
  const normalized = text.trim()
  if (allowedNamePatterns.some((pattern) => pattern.test(normalized))) {
    return false
  }

  return filter.isProfane(text)
}
