import { ActionAttributes, Actions } from "../types/game";

export const getActionMessage = ({ action, pending, actionPlayer, targetPlayer }: {
  action: Actions
  pending?: boolean
  actionPlayer: string
  targetPlayer?: string
}) =>
  ActionAttributes[action].messageTemplates[pending ? 'pending' : 'complete']
    .replaceAll('<actionPlayer>', actionPlayer)
    .replaceAll('<targetPlayer>', targetPlayer)
