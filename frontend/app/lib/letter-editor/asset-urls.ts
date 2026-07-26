import type { ThemeElement } from '@/app/types/letter-editor';

const APP_ASSET_PATH = /^\/[a-z0-9_./-]+\.(?:avif|gif|jpe?g|png|svg|webp)$/i;
const SAFE_IMAGE_DATA_URL = /^data:image\/(?:avif|gif|jpe?g|png|webp);base64,[a-z0-9+/=\s]+$/i;
const LOCAL_FILE_PATH = /^(?:file:|blob:|[a-z]:[\\/]|\\\\|\/(?:home|users|src|var|tmp)(?:\/|$))/i;
const LOCAL_HOST_URL = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i;

export function isSafeImageAssetUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (LOCAL_FILE_PATH.test(value) || LOCAL_HOST_URL.test(value)) return false;
  return APP_ASSET_PATH.test(value) || SAFE_IMAGE_DATA_URL.test(value);
}

export function sanitizeUserElements(value: unknown): ThemeElement[] {
  if (!Array.isArray(value)) return [];
  return value.filter((element): element is ThemeElement => {
    if (!element || typeof element !== 'object') return false;
    const candidate = element as Partial<ThemeElement>;
    if (candidate.source !== 'user' || typeof candidate.id !== 'string') {
      return false;
    }
    return candidate.type !== 'image' || isSafeImageAssetUrl(candidate.src);
  });
}
