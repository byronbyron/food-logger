import { DriveData } from '@/types';

const DRIVE_FILE_NAME = process.env.DRIVE_FILE_NAME || 'food-log-data.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

const emptyData = (): DriveData => ({
  logs: {},
  quickButtons: [],
  updatedAt: new Date().toISOString(),
});

async function driveFetch(accessToken: string, url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });
  return res;
}

/** Find the food-log-data.json file in the user's Drive, if it exists. */
export async function findFileId(accessToken: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and trashed=false`);
  const res = await driveFetch(
    accessToken,
    `${DRIVE_API}/files?q=${q}&fields=files(id,name)&spaces=drive`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

/** Read and parse the JSON content of a Drive file. */
export async function readFile(accessToken: string, fileId: string): Promise<DriveData | null> {
  const res = await driveFetch(accessToken, `${DRIVE_API}/files/${fileId}?alt=media`);
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Create the Drive file for the first time. Returns the new file ID. */
export async function createFile(accessToken: string, data: DriveData): Promise<string | null> {
  const metadata = { name: DRIVE_FILE_NAME };
  const boundary = 'food_log_boundary';
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${JSON.stringify(data)}\r\n` +
    `--${boundary}--`;

  const res = await driveFetch(
    accessToken,
    `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id`,
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    }
  );
  if (!res.ok) return null;
  const result = await res.json();
  return result.id ?? null;
}

/** Overwrite the content of an existing Drive file. */
export async function updateFile(accessToken: string, fileId: string, data: DriveData): Promise<boolean> {
  const res = await driveFetch(
    accessToken,
    `${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return res.ok;
}

/**
 * Load the user's data, creating an empty file if none exists yet.
 * Returns both the data and the resolved file ID so callers can cache it.
 */
export async function loadOrInitData(
  accessToken: string,
  cachedFileId?: string | null
): Promise<{ data: DriveData; fileId: string }> {
  let fileId = cachedFileId ?? (await findFileId(accessToken));

  if (!fileId) {
    const fresh = emptyData();
    const newId = await createFile(accessToken, fresh);
    if (!newId) throw new Error('Failed to create Drive file');
    return { data: fresh, fileId: newId };
  }

  const data = await readFile(accessToken, fileId);
  if (!data) {
    // File ID was stale (e.g. deleted) — recreate
    const fresh = emptyData();
    const newId = await createFile(accessToken, fresh);
    if (!newId) throw new Error('Failed to recreate Drive file');
    return { data: fresh, fileId: newId };
  }

  return { data, fileId };
}

export async function saveData(accessToken: string, fileId: string, data: DriveData): Promise<void> {
  const payload: DriveData = { ...data, updatedAt: new Date().toISOString() };
  const ok = await updateFile(accessToken, fileId, payload);
  if (!ok) throw new Error('Failed to save data to Drive');
}
