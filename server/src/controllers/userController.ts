import { json } from 'body-parser'
import { Application, Request, RequestHandler, Response } from 'express'
import { adminAuth } from '../firebase'
import { verifyIdToken } from '../auth'
import { containsProfanity } from '../utilities/profanity'
import {
  deleteUserStats,
  getDisplayName,
  getLeaderboard,
  getUserStats,
  setDisplayName,
} from '../utilities/stats'

export const registerUserControllers = ({
  app,
  apiLimiter,
  genericErrorMessage,
}: {
  app: Application
  apiLimiter: RequestHandler
  genericErrorMessage: string
}) => {
  app.get('/api/users/:uid/stats', apiLimiter, async (req: Request, res: Response) => {
    try {
      const stats = await getUserStats(req.params.uid as string)
      if (!stats) {
        res.status(404).json({ error: 'User not found' })
        return
      }
      res.json(stats)
    } catch (error) {
      console.error('Error fetching user stats:', error)
      res.status(500).json({ error: genericErrorMessage })
    }
  })

  app.get('/api/users/:uid/displayName', apiLimiter, async (req: Request, res: Response) => {
    try {
      const displayName = await getDisplayName(req.params.uid as string)
      res.json({ displayName })
    } catch (error) {
      console.error('Error fetching display name:', error)
      res.status(500).json({ error: genericErrorMessage })
    }
  })

  app.put('/api/users/displayName', apiLimiter, json(), async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }

      const token = authHeader.split('Bearer ')[1]
      const decoded = await verifyIdToken(token)
      if (!decoded) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }

      const { displayName, photoURL } = req.body as { displayName?: unknown, photoURL?: string }
      if (!displayName || typeof displayName !== 'string') {
        res.status(400).json({ error: 'displayNameRequired' })
        return
      }

      const trimmed = displayName.trim().slice(0, 10)
      if (trimmed.length === 0) {
        res.status(400).json({ error: 'displayNameRequired' })
        return
      }

      if (containsProfanity(trimmed)) {
        res.status(400).json({ error: 'inappropriateDisplayName' })
        return
      }

      const result = await setDisplayName(decoded.uid, trimmed, photoURL)
      if (result.error) {
        res.status(409).json({ error: result.error })
        return
      }
      res.json({ displayName: trimmed })
    } catch (error) {
      console.error('Error setting display name:', error)
      res.status(500).json({ error: genericErrorMessage })
    }
  })

  app.delete('/api/users/account', apiLimiter, async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }

      const token = authHeader.split('Bearer ')[1]
      const decoded = await verifyIdToken(token)
      if (!decoded) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }

      await deleteUserStats(decoded.uid)
      await adminAuth.deleteUser(decoded.uid)
      res.json({ success: true })
    } catch (error) {
      console.error('Error deleting user account:', error)
      res.status(500).json({ error: genericErrorMessage })
    }
  })

  app.get('/api/leaderboard', apiLimiter, async (req: Request, res: Response) => {
    try {
      const minGames = Number.parseInt(req.query.minGames as string) || 5
      const limit = Math.min(Number.parseInt(req.query.limit as string) || 50, 100)
      const uid = req.query.uid as string | undefined
      const leaderboard = await getLeaderboard(minGames, limit, uid)
      res.json(leaderboard)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      res.status(500).json({ error: genericErrorMessage })
    }
  })
}
