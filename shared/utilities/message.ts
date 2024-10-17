import { ActionAttributes, Actions } from "../types/game";

export const getActionMessage = ({ action, tense, actionPlayer, targetPlayer }: {
  action: Actions
  tense: 'confirm' | 'pending' | 'complete'
  actionPlayer: string
  targetPlayer?: string | undefined
}) => {
  const messageTemplate = ActionAttributes[action].messageTemplates[tense];

  if (!messageTemplate) {
    throw new Error('Message Template not found')
  }

  return messageTemplate
    .replaceAll('<actionPlayer>', actionPlayer)
    .replaceAll('<targetPlayer>', targetPlayer ?? '');
}
