const STORAGE_KEY = "green-api-credentials"

export type Credentials = {
  idInstance: string
  apiTokenInstance: string
}

function readStored(raw: string | null): Credentials | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<Credentials>
    if (
      typeof parsed.idInstance !== "string" ||
      typeof parsed.apiTokenInstance !== "string" ||
      !parsed.idInstance ||
      !parsed.apiTokenInstance
    ) {
      return null
    }
    return {
      idInstance: parsed.idInstance,
      apiTokenInstance: parsed.apiTokenInstance,
    }
  } catch {
    return null
  }
}

export function setCredentials(
  credentials: Credentials,
  remember = true,
): void {
  const payload = JSON.stringify(credentials)
  if (remember) {
    sessionStorage.removeItem(STORAGE_KEY)
    localStorage.setItem(STORAGE_KEY, payload)
    return
  }
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.setItem(STORAGE_KEY, payload)
}

export function getCredentials(): Credentials | null {
  return (
    readStored(sessionStorage.getItem(STORAGE_KEY)) ??
    readStored(localStorage.getItem(STORAGE_KEY))
  )
}

export function clearCredentials(): void {
  sessionStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(STORAGE_KEY)
}
