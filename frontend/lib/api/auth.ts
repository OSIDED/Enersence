import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ApiError,
  User,
} from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

/**
 * All auth requests use credentials: "include" so the browser sends and
 * receives the httpOnly auth_token cookie set by Spring Boot. The token
 * itself is never readable or storable from JS -- this is the point of
 * httpOnly cookies over localStorage.
 */
async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

function friendlyError(status: number, detail?: string): string {
  switch (status) {
    case 400:
      return detail || "Please check the information you entered.";
    case 401:
      return "Invalid email or password.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "That resource could not be found.";
    case 409:
      return detail || "An account with this email already exists.";
    case 500:
      return "Something went wrong on our end. Please try again.";
    default:
      return detail || "Unable to connect to the server. Please try again.";
  }
}

async function parseErrorAndThrow(res: Response): Promise<never> {
  let detail: string | undefined;
  try {
    const body = await res.json();
    detail = body.detail;
  } catch {
    // response wasn't JSON (e.g. network-level failure surfaced as a response)
  }
  const error: ApiError = {
    detail: friendlyError(res.status, detail),
    status: res.status,
  };
  throw error;
}

export async function register(
  payload: RegisterRequest,
): Promise<AuthResponse> {
  const res = await authFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) return parseErrorAndThrow(res);
  return res.json();
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const res = await authFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) return parseErrorAndThrow(res);
  return res.json();
}

export async function logout(): Promise<void> {
  await authFetch("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<User | null> {
  const res = await authFetch("/api/auth/me", { method: "GET" });
  if (res.status === 401) return null; // not an error -- just "no session"
  if (!res.ok) return parseErrorAndThrow(res);
  return res.json();
}

/**
 * NOT YET SUPPORTED BY THE BACKEND.
 *
 * Spring Boot does not currently have /api/auth/forgot-password or the
 * email-sending infrastructure (SMTP/SendGrid/etc.) required to deliver a
 * reset link. This function is wired to the expected future contract so
 * the frontend is ready, but currently throws rather than silently
 * pretending to succeed. See the README for exactly what needs to be
 * built on the backend.
 */
export async function forgotPassword(email: string): Promise<void> {
  const res = await authFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) return parseErrorAndThrow(res);
}

/** NOT YET SUPPORTED BY THE BACKEND -- see forgotPassword() note above. */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const res = await authFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) return parseErrorAndThrow(res);
}
