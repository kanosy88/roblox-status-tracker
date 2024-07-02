import fs from "fs";
import type {
  Config,
  Friends,
  TrackedUser,
  TrackedUsers,
  UserData,
  UserPresences,
} from "./types/type";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";

function readConfig(filePath: string): any {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

const config: Config = readConfig("./config.json");

function validateConfig(): boolean {
  const requiredKeys = ["roblox_cookie", "interval"];
  for (const key of requiredKeys) {
    if (!config[key]) {
      console.error(`Missing config key: ${key}`);
      return false;
    }
  }
  if (typeof config.interval !== "number" || config.interval < 5) {
    console.error("Interval must be a number and at least 5");
    return false;
  }
  return true;
}

async function fetchUserData() {
  const RequestConfig: AxiosRequestConfig = {
    url: "https://users.roblox.com/v1/users/authenticated",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `.ROBLOSECURITY=${config.roblox_cookie}`,
    },
  };

  try {
    const res = await axios(RequestConfig);
    return res.data as UserData;
  } catch (err: any) {
    if (err.response && err.response.data.errors[0].code === 0) {
      // If the error code is 0, it means the cookie is invalid.
      console.error(
        "Invalid cookie provided in config.json. Please provide a valid cookie."
      );
      return false;
    }
    console.error("An error occurred while fetching user data:", err);
    return false;
  }
}

async function get_friends(user_id: number) {
  const RequestConfig: AxiosRequestConfig = {
    url: `https://friends.roblox.com/v1/users/${user_id}/friends`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `.ROBLOSECURITY=${config.roblox_cookie}`,
    },
  };

  try {
    const res = await axios(RequestConfig);
    return res.data as Friends;
  } catch (err) {
    console.error("An error occurred while fetching friends list:", err);
    return false;
  }
}

async function get_presence(user_ids: number[]) {
  const RequestConfig: AxiosRequestConfig = {
    url: `https://presence.roblox.com/v1/presence/users`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `.ROBLOSECURITY=${config.roblox_cookie}`,
    },
    data: {
      userIds: user_ids,
    },
  };

  try {
    const res = await axios(RequestConfig);
    return res.data as UserPresences;
  } catch (err) {
    console.error("An error occurred while fetching presence data:", err);
    return false;
  }
}

async function main() {
  console.clear();
  console.log("Welcome to Roblox Status Tracker!");

  const isConfigValid = validateConfig();
  if (!isConfigValid) return;

  const user_data = await fetchUserData();
  if (!user_data) return;

  console.log(`Suffessfully logged in as ${user_data?.displayName}!`);

  const friends = await get_friends(user_data.id);

  async function get_tracked_user() {
    if (!friends) return;

    const presence = await get_presence(
      friends.data.map((friend) => friend.id)
    );
    if (!presence) return;

    const tracked_users: TrackedUsers = friends.data.reduce(
      (acc: TrackedUsers, friend) => {
        const user = presence.userPresences.find(
          (presence) => presence.userId === friend.id
        );

        acc[friend.id] = { ...friend, presence: user || null };

        return acc;
      },
      {}
    );

    return tracked_users;
  }

  let last_users_data = {} as TrackedUsers;

  async function check_status_changes() {
    console.log("Checking for status changes...");
    const current_users_data = await get_tracked_user();
    if (!current_users_data) return;

    // Check user status changes
    Object.entries(current_users_data).forEach(
      ([id, current_user_data]: [any, TrackedUser]) => {
        const last_user_data = last_users_data[id];
        const last_user_presence_type =
          last_user_data?.presence?.userPresenceType;

        if (
          last_user_presence_type !==
          current_user_data.presence?.userPresenceType
        ) {
          if (current_user_data.presence?.userPresenceType === 2) {
            console.log(
              `${current_user_data.name} is now playing ${current_user_data.presence.lastLocation}!`
            );
          }
        }
      }
    );

    // Update last_user_data
    last_users_data = current_users_data;
  }

  const interval = config.interval * 1000;

  check_status_changes();
  setInterval(async () => {
    await check_status_changes();
  }, interval);
}

main();
