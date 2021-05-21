/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMMR = /* GraphQL */ `
  query GetMMR($id: ID!) {
    getMMR(id: $id) {
      id
      userid
      mmr
      createdAt
      updatedAt
    }
  }
`;
export const listMMRs = /* GraphQL */ `
  query ListMMRs(
    $filter: ModelMMRFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMMRs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userid
        mmr
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getSessionWaiting = /* GraphQL */ `
  query GetSessionWaiting($id: ID!) {
    getSessionWaiting(id: $id) {
      id
      userid
      mmr
      createdAt
      updatedAt
    }
  }
`;
export const listSessionWaitings = /* GraphQL */ `
  query ListSessionWaitings(
    $filter: ModelSessionWaitingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSessionWaitings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userid
        mmr
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getSessionMatching = /* GraphQL */ `
  query GetSessionMatching($id: ID!) {
    getSessionMatching(id: $id) {
      id
      userid
      gameid
      createdAt
      updatedAt
    }
  }
`;
export const listSessionMatchings = /* GraphQL */ `
  query ListSessionMatchings(
    $filter: ModelSessionMatchingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSessionMatchings(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userid
        gameid
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getOnGameSession = /* GraphQL */ `
  query GetOnGameSession($id: ID!) {
    getOnGameSession(id: $id) {
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
export const listOnGameSessions = /* GraphQL */ `
  query ListOnGameSessions(
    $filter: ModelOnGameSessionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOnGameSessions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getOnGameSkill = /* GraphQL */ `
  query GetOnGameSkill($id: ID!) {
    getOnGameSkill(id: $id) {
      id
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
export const listOnGameSkills = /* GraphQL */ `
  query ListOnGameSkills(
    $filter: ModelOnGameSkillFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOnGameSkills(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        gameid
        skill_name
        skill_state
        source_player
        target_player
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getSkillSummary = /* GraphQL */ `
  query GetSkillSummary($id: ID!) {
    getSkillSummary(id: $id) {
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
export const listSkillSummarys = /* GraphQL */ `
  query ListSkillSummarys(
    $filter: ModelSkillSummaryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSkillSummarys(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
