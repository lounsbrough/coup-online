export const playerIdStorageKey = 'coupPlayerId';
export const activeColorModeStorageKey = 'coupActiveColorMode';
export const confirmActionsStorageKey = 'coupConfirmActions';
export const showBackgroundImageStorageKey = 'coupShowBackgroundImage';
export const activeLanguageStorageKey = 'coupActiveLanguage';
export const eventLogRetentionTurnsStorageKey = 'coupEventLogRetentionTurns';
export const allowReviveStorageKey = 'coupAllowRevive';
export const speedRoundEnabledStorageKey = 'coupSpeedRoundEnabled';
export const speedRoundSecondsStorageKey = 'coupSpeedRoundSeconds';
export const chooseAiPersonalityStorageKey = 'coupChooseAiPersonality';
export const getLatestReadMessageIdStorageKey = (roomId: string) =>
  `coupLatestReadMessageId-${roomId}`;
