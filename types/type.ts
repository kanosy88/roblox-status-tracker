export type Config = {
  roblox_cookie: string;
  interval: number;
  [key: string]: any;
};

export type UserData = {
  id: number;
  name: string;
  displayName: string;
};

export type Friend = {
  isOnline: boolean;
  isDeleted: boolean;
  friendFrequentScore: number;
  friendFrequentRank: number;
  hasVerifiedBadge: boolean;
  description: string;
  created: string;
  isBanned: boolean;
  externalAppDisplayName: string;
  id: number;
  name: string;
  displayName: string;
};

export type Friends = {
  data: Friend[];
};

export type UserPresence = {
  userPresenceType: number;
  lastLocation: string;
  placeId: number;
  rootPlaceId: number;
  gameId: number;
  universeId: number;
  userId: number;
  lastOnline: string;
};

export type UserPresences = {
  userPresences: UserPresence[];
};

export type TrackedUser = Friend & {
  presence: UserPresence | null;
};

export type TrackedUsers = {
  [id: number]: TrackedUser;
};
