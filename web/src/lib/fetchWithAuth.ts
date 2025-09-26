import { getAccessToken } from './session'

interface FetchWithAuthOptions extends RequestInit {
  auth?: boolean
}

export async function fetchWithAuth(
  input: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { auth = true, headers = {}, ...init } = options

  // If auth is required, add Authorization header
  if (auth) {
    const token = await getAccessToken()
    console.log('fetchWithAuth: token retrieved:', token ? `${token.substring(0, 20)}...` : 'null')
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`
    } else {
      console.warn('No access token available for authenticated request')
    }
  }

  // Set content-type for JSON bodies, but not for FormData
  if (init.body && !(init.body instanceof FormData)) {
    if (!headers.hasOwnProperty('Content-Type')) {
      (headers as any)['Content-Type'] = 'application/json'
    }
  }

  return fetch(input, {
    ...init,
    headers
  })
}