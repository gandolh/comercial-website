import { axiosInstance } from "@core/lib/axios";

export interface UpdateProfileRequest {
  display_name?: string;
  avatar_s3_key?: string;
  email_notifications?: boolean;
  bio?: string | null;
  website?: string | null;
  social_twitter?: string | null;
  social_instagram?: string | null;
  social_github?: string | null;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UploadUrlRequest {
  content_type: string;
  filename: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
  public_url: string;
}

export interface AvatarUploadResponse {
  public_url: string;
  s3_key: string;
}

export interface UploadAvatarOptions {
  onUploadProgress?: (progress: number) => void;
}

// ---------------------------------------------------------------------------
// Token → real s3_key mapping.
// getAvatarUploadUrl returns a placeholder token as s3_key.
// After the real upload completes (inside the patched fetch interceptor),
// we store the real s3_key here so that updateProfile can substitute it.
// ---------------------------------------------------------------------------
const _tokenToRealS3Key = new Map<string, string>();

/**
 * Update profile data.
 * If avatar_s3_key is a pending token from getAvatarUploadUrl, it is
 * transparently replaced with the real s3_key from the completed upload.
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  const payload = { ...data };
  if (payload.avatar_s3_key && _tokenToRealS3Key.has(payload.avatar_s3_key)) {
    payload.avatar_s3_key = _tokenToRealS3Key.get(payload.avatar_s3_key);
    _tokenToRealS3Key.delete(data.avatar_s3_key!);
  }
  await axiosInstance.patch("/users/me", payload);
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await axiosInstance.patch("/users/me/password", data);
}

/**
 * Upload a new avatar image via multipart/form-data (single-step).
 * Backend: POST /users/me/avatar
 * Response: { public_url, s3_key }
 */
export async function uploadAvatar(
  file: File,
  options?: UploadAvatarOptions,
): Promise<AvatarUploadResponse> {
  const form = new FormData();
  form.append("file", file, file.name);

  const res = await axiosInstance.post<AvatarUploadResponse>(
    "/users/me/avatar",
    form,
    {
      onUploadProgress: (event) => {
        if (!options?.onUploadProgress || !event.total) return;
        const progress = Math.round((event.loaded * 100) / event.total);
        options.onUploadProgress(progress);
      },
    },
  );

  return res.data;
}

// ---------------------------------------------------------------------------
// Legacy compat shim for getAvatarUploadUrl.
//
// The old hook (useProfile.ts) does:
//   const { upload_url, s3_key, public_url } = await getAvatarUploadUrl({ content_type, filename });
//   await fetch(upload_url, { method: 'PUT', body: file, headers: { 'Content-Type': contentType } });
//   return { s3_key, public_url };
//
// Strategy:
//  1. Return a synthetic URL as upload_url and a placeholder token as s3_key.
//  2. Monkey-patch window.fetch once so PUT to the synthetic URL intercepts
//     the file and runs the real multipart POST to /users/me/avatar.
//  3. Store the real s3_key from the upload under the placeholder token so
//     that updateProfile (above) can substitute it when the component calls
//     PATCH /users/me with { avatar_s3_key: token }.
// ---------------------------------------------------------------------------

const SYNTHETIC_SCHEME = "pending://avatar/";
let _fetchPatched = false;

function ensureFetchPatched(): void {
  if (_fetchPatched) return;
  _fetchPatched = true;

  const originalFetch = (window.fetch as typeof fetch).bind(window);

  (window as any).fetch = async function patchedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;

    if (url.startsWith(SYNTHETIC_SCHEME) && (init?.method ?? "GET").toUpperCase() === "PUT") {
      const token = url.slice(SYNTHETIC_SCHEME.length);
      const file = init?.body as File | undefined;

      if (file instanceof File) {
        try {
          const result = await uploadAvatar(file);
          // Store real s3_key under token so updateProfile can look it up.
          _tokenToRealS3Key.set(token, result.s3_key);
        } catch (err) {
          // Re-throw so the hook's try/catch sees the error.
          throw err;
        }
      }

      // Return a synthetic 200 so the hook's await fetch(...) resolves cleanly.
      return new Response(null, { status: 200 });
    }

    return originalFetch(input, init);
  };
}

/**
 * @deprecated Use uploadAvatar() directly instead.
 * Kept for backward compatibility with useProfile hook.
 */
export async function getAvatarUploadUrl(_data: UploadUrlRequest): Promise<UploadUrlResponse> {
  ensureFetchPatched();

  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const syntheticUrl = `${SYNTHETIC_SCHEME}${token}`;

  return {
    upload_url: syntheticUrl,
    s3_key: token,
    public_url: "",
  };
}
