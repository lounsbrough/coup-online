import crypto from 'crypto'
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// https://github.com/jsdom/jsdom/issues/2524
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

Object.defineProperty(global.self, 'crypto', {
  value: {
    randomUUID: () => crypto.randomUUID()
  }
})
