import { ActionAttributes, Actions } from "../types/game";

export const getActionMessage = ({ action, tense, actionPlayer, targetPlayer }: {
  action: Actions
  tense: 'confirm' | 'pending' | 'complete'
  actionPlayer: string
  targetPlayer?: string
}) =>
  ActionAttributes[action].messageTemplates[tense]
    .replaceAll('<actionPlayer>', actionPlayer)
    .replaceAll('<targetPlayer>', targetPlayer)
