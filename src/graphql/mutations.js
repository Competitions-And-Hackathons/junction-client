/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMMR = /* GraphQL */ `
  mutation CreateMMR(
    $input: CreateMMRInput!
    $condition: ModelMMRConditionInput
  ) {
    createMMR(input: $input, condition: $condition) {
      id
      userid
      mmr
      createdAt
      updatedAt
    }
  }
`;
export const updateMMR = /* GraphQL */ `
  mutation UpdateMMR(
    $input: UpdateMMRInput!
    $condition: ModelMMRConditionInput
  ) {
    updateMMR(input: $input, condition: $condition) {
      id
      userid
      mmr
      createdAt
      updatedAt
    }
  }
`;
export const deleteMMR = /* GraphQL */ `
  mutation DeleteMMR(
    $input: DeleteMMRInput!
    $condition: ModelMMRConditionInput
  ) {
    deleteMMR(input: $input, condition: $condition) {
      id
      userid
      mmr
      createdAt
      updatedAt
    }
  }
`;
export const createSessionWaiting = /* GraphQL */ `
  mutation CreateSessionWaiting(
    $input: CreateSessionWaitingInput!
    $condition: ModelSessionWaitingConditionInput
  ) {
    createSessionWaiting(input: $input, condition: $condition) {
      id
      userid
      mmr
      createdAt
      updatedAt
    }
  }
`;
export const updateSessionWaiting = /* GraphQL */ `
  mutation UpdateSessionWaiting(
    $input: UpdateSessionWaitingInput!
    $condition: ModelSessionWaitingConditionInput
  ) {
    updateSessionWaiting(input: $input, condition: $condition) {
      id
      userid
      mmr
      createdAt
      updatedAt
    }
  }
`;
export const deleteSessionWaiting = /* GraphQL */ `
  mutation DeleteSessionWaiting(
    $input: DeleteSessionWaitingInput!
    $condition: ModelSessionWaitingConditionInput
  ) {
    deleteSessionWaiting(input: $input, condition: $condition) {
      id
      userid
      mmr
      createdAt
      updatedAt
    }
  }
`;
export const createSessionMatching = /* GraphQL */ `
  mutation CreateSessionMatching(
    $input: CreateSessionMatchingInput!
    $condition: ModelSessionMatchingConditionInput
  ) {
    createSessionMatching(input: $input, condition: $condition) {
      id
      userid
      gameid
      createdAt
      updatedAt
    }
  }
`;
export const updateSessionMatching = /* GraphQL */ `
  mutation UpdateSessionMatching(
    $input: UpdateSessionMatchingInput!
    $condition: ModelSessionMatchingConditionInput
  ) {
    updateSessionMatching(input: $input, condition: $condition) {
      id
      userid
      gameid
      createdAt
      updatedAt
    }
  }
`;
export const deleteSessionMatching = /* GraphQL */ `
  mutation DeleteSessionMatching(
    $input: DeleteSessionMatchingInput!
    $condition: ModelSessionMatchingConditionInput
  ) {
    deleteSessionMatching(input: $input, condition: $condition) {
      id
      userid
      gameid
      createdAt
      updatedAt
    }
  }
`;
export const createOnGameSession = /* GraphQL */ `
  mutation CreateOnGameSession(
    $input: CreateOnGameSessionInput!
    $condition: ModelOnGameSessionConditionInput
  ) {
    createOnGameSession(input: $input, condition: $condition) {
      id
      player1_id
      player1_x
      player2_id
      player2_x
      player3_id
      player3_x
      player4_id
      player4_x
      createdAt
      updatedAt
    }
  }
`;
export const updateOnGameSession = /* GraphQL */ `
  mutation UpdateOnGameSession(
    $input: UpdateOnGameSessionInput!
    $condition: ModelOnGameSessionConditionInput
  ) {
    updateOnGameSession(input: $input, condition: $condition) {
      id
      player1_id
      player1_x
      player2_id
      player2_x
      player3_id
      player3_x
      player4_id
      player4_x
      createdAt
      updatedAt
    }
  }
`;
export const deleteOnGameSession = /* GraphQL */ `
  mutation DeleteOnGameSession(
    $input: DeleteOnGameSessionInput!
    $condition: ModelOnGameSessionConditionInput
  ) {
    deleteOnGameSession(input: $input, condition: $condition) {
      id
      player1_id
      player1_x
      player2_id
      player2_x
      player3_id
      player3_x
      player4_id
      player4_x
      createdAt
      updatedAt
    }
  }
`;
export const createOnGameSkill = /* GraphQL */ `
  mutation CreateOnGameSkill(
    $input: CreateOnGameSkillInput!
    $condition: ModelOnGameSkillConditionInput
  ) {
    createOnGameSkill(input: $input, condition: $condition) {
      id
      skill
      gameid
      skill_name
      skill_state
      source_player
      target_player
      createdAt
      updatedAt
    }
  }
`;
export const updateOnGameSkill = /* GraphQL */ `
  mutation UpdateOnGameSkill(
    $input: UpdateOnGameSkillInput!
    $condition: ModelOnGameSkillConditionInput
  ) {
    updateOnGameSkill(input: $input, condition: $condition) {
      id
      skill
      gameid
      skill_name
      skill_state
      source_player
      target_player
      createdAt
      updatedAt
    }
  }
`;
export const deleteOnGameSkill = /* GraphQL */ `
  mutation DeleteOnGameSkill(
    $input: DeleteOnGameSkillInput!
    $condition: ModelOnGameSkillConditionInput
  ) {
    deleteOnGameSkill(input: $input, condition: $condition) {
      id
      skill
      gameid
      skill_name
      skill_state
      source_player
      target_player
      createdAt
      updatedAt
    }
  }
`;
export const createSkillSummary = /* GraphQL */ `
  mutation CreateSkillSummary(
    $input: CreateSkillSummaryInput!
    $condition: ModelSkillSummaryConditionInput
  ) {
    createSkillSummary(input: $input, condition: $condition) {
      id
      gameid
      sourced_tanos
      sourced_backdoor
      sourced_infinite
      sourced_shoot
      sourced_doom
      targeted_tanos
      targeted_backdoor
      targeted_infinite
      targeted_shoot
      targeted_doom
      createdAt
      updatedAt
    }
  }
`;
export const updateSkillSummary = /* GraphQL */ `
  mutation UpdateSkillSummary(
    $input: UpdateSkillSummaryInput!
    $condition: ModelSkillSummaryConditionInput
  ) {
    updateSkillSummary(input: $input, condition: $condition) {
      id
      gameid
      sourced_tanos
      sourced_backdoor
      sourced_infinite
      sourced_shoot
      sourced_doom
      targeted_tanos
      targeted_backdoor
      targeted_infinite
      targeted_shoot
      targeted_doom
      createdAt
      updatedAt
    }
  }
`;
export const deleteSkillSummary = /* GraphQL */ `
  mutation DeleteSkillSummary(
    $input: DeleteSkillSummaryInput!
    $condition: ModelSkillSummaryConditionInput
  ) {
    deleteSkillSummary(input: $input, condition: $condition) {
      id
      gameid
      sourced_tanos
      sourced_backdoor
      sourced_infinite
      sourced_shoot
      sourced_doom
      targeted_tanos
      targeted_backdoor
      targeted_infinite
      targeted_shoot
      targeted_doom
      createdAt
      updatedAt
    }
  }
`;
