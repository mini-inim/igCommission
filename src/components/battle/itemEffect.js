// src/utils/itemEffects.js

export const ITEM_EFFECTS = {
  ATTACK: 'attack',           // 공격권
  SPECIAL_ATTACK: 'special_attack', // 특수 공격권
  DEFENSE: 'defense',         // 방어권
  HEAL: 'heal',              // 치료권
  SPECIAL_HEAL: 'special_heal' // 특수 치료권
};

export const ITEM_EFFECT_NAMES = {
  [ITEM_EFFECTS.ATTACK]: '공격권',
  [ITEM_EFFECTS.SPECIAL_ATTACK]: '특수 공격권',
  [ITEM_EFFECTS.DEFENSE]: '방어권',
  [ITEM_EFFECTS.HEAL]: '치료권',
  [ITEM_EFFECTS.SPECIAL_HEAL]: '특수 치료권'
};

export const ITEM_EFFECT_DESCRIPTIONS = {
  [ITEM_EFFECTS.ATTACK]: '지목한 상대의 부상을 1 증가시킵니다',
  [ITEM_EFFECTS.SPECIAL_ATTACK]: '지목한 상대가 소속된 팀 전체의 부상을 1씩 증가시킵니다',
  [ITEM_EFFECTS.DEFENSE]: '다음 공격을 방어합니다 (아직 구현되지 않음)',
  [ITEM_EFFECTS.HEAL]: '지목한 상대의 부상을 1 감소시킵니다',
  [ITEM_EFFECTS.SPECIAL_HEAL]: '지목한 상대의 부상을 전부 제거합니다'
};

export const ITEM_EFFECT_COLORS = {
  [ITEM_EFFECTS.ATTACK]: 'text-red-600 bg-red-100',
  [ITEM_EFFECTS.SPECIAL_ATTACK]: 'text-red-800 bg-red-200',
  [ITEM_EFFECTS.DEFENSE]: 'text-blue-600 bg-blue-100',
  [ITEM_EFFECTS.HEAL]: 'text-green-600 bg-green-100',
  [ITEM_EFFECTS.SPECIAL_HEAL]: 'text-green-800 bg-green-200'
};

export const ITEM_EFFECT_EMOJIS = {
  [ITEM_EFFECTS.ATTACK]: '⚔️',
  [ITEM_EFFECTS.SPECIAL_ATTACK]: '💥',
  [ITEM_EFFECTS.DEFENSE]: '🛡️',
  [ITEM_EFFECTS.HEAL]: '💚',
  [ITEM_EFFECTS.SPECIAL_HEAL]: '✨'
};

// 아이템 효과 실행 함수들
export const executeItemEffect = async (effect, targetUserId, targetTeam, battleContext) => {
  const { updateInjuries, updateTeamInjuries, getBattleUserById } = battleContext;
  
  switch (effect) {
    case ITEM_EFFECTS.ATTACK:
      if (!targetUserId) throw new Error('공격 대상을 선택해주세요.');
      await updateInjuries(targetUserId, 1);
      return `${getBattleUserById(targetUserId)?.displayName}에게 공격을 가했습니다! 부상 +1`;

    case ITEM_EFFECTS.SPECIAL_ATTACK:
      if (!targetUserId) throw new Error('공격 대상을 선택해주세요.');
      const targetUser = getBattleUserById(targetUserId);
      if (!targetUser?.team) throw new Error('대상의 팀 정보를 찾을 수 없습니다.');
      const affectedCount = await updateTeamInjuries(targetUser.team, 1);
      return `${targetUser.team} 팀 전체를 공격했습니다! ${affectedCount}명의 부상 +1`;

    case ITEM_EFFECTS.DEFENSE:
      // 방어권 기능은 추후 구현
      throw new Error('방어권 기능은 아직 구현되지 않았습니다.');

    case ITEM_EFFECTS.HEAL:
      if (!targetUserId) throw new Error('치료 대상을 선택해주세요.');
      await updateInjuries(targetUserId, -1);
      return `${getBattleUserById(targetUserId)?.displayName}을 치료했습니다! 부상 -1`;

    case ITEM_EFFECTS.SPECIAL_HEAL:
      if (!targetUserId) throw new Error('치료 대상을 선택해주세요.');
      const healTarget = getBattleUserById(targetUserId);
      const currentInjuries = healTarget?.injuries || 0;
      await updateInjuries(targetUserId, -currentInjuries);
      return `${healTarget?.displayName}을 완전히 치료했습니다! 모든 부상 제거`;

    default:
      throw new Error('알 수 없는 아이템 효과입니다.');
  }
};