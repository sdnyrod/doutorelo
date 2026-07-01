export const USER_INFO_STORAGE_KEY = "doutorelo-session-info";

type StorageReader = {
  getItem: (key: string) => string | null;
};

export function buildPreparationPath(intention: string) {
  const normalizedIntention = intention.trim().slice(0, 700);
  const params = new URLSearchParams();
  params.set("intencao", normalizedIntention);
  return `/preparar-consulta?${params.toString()}`;
}

export function hasKnownAuthenticatedUser(storage?: StorageReader) {
  const readableStorage = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
  if (!readableStorage) return false;

  try {
    const rawUser = readableStorage.getItem(USER_INFO_STORAGE_KEY);
    if (!rawUser || rawUser === "null") return false;

    const parsedUser = JSON.parse(rawUser);
    return Boolean(parsedUser?.id || parsedUser?.openId || parsedUser?.name || parsedUser?.email);
  } catch {
    return false;
  }
}
