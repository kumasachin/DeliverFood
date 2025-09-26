import { httpClient } from "./client";

export interface BlockedUser {
  uuid: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export const searchUserByEmail = async (
  email: string
): Promise<BlockedUser> => {
  const response = await httpClient.get<BlockedUser>("/users/search", {
    params: { email },
  });
  return response.data;
};

export const getBlockedUsers = async (): Promise<BlockedUser[]> => {
  const response = await httpClient.get<BlockedUser[]>("/blocked-users");
  return response.data;
};

export const blockUser = async (userUuid: string): Promise<void> => {
  await httpClient.post(`/block/${userUuid}`);
};

export const unblockUser = async (userUuid: string): Promise<void> => {
  await httpClient.post(`/unblock/${userUuid}`);
};
