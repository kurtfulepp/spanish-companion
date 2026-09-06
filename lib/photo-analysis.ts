import type { CEFRLevel } from './cefr';

export type PhotoAnalysis = {
  suggested_title: string;
  items: { english: string; spanish: string; usage_note: string | null }[];
  requires_review: true;
  cefr_level: CEFRLevel;
};
const messages: Record<string, string> = {
  authentication_required: 'Sign in again to analyze a photo.',
  vision_not_configured: 'Photo recognition is not configured yet. Please try again later.',
  quota_unavailable: 'Photo recognition is temporarily unavailable. Your photo has not been sent for analysis.',
  photo_limit_reached: 'You have reached the photo limit. Wait before trying again.',
  vision_limit_reached: 'Photo recognition has reached its usage or spending limit. Please try again later.',
  photo_not_supported: 'This photo could not be analyzed. Choose another photo.',
  profile_level_required: 'Set your Spanish level before analyzing a photo.',
};
export async function requestPhotoAnalysis(photo: Blob, signal: AbortSignal, fetcher: typeof fetch = fetch): Promise<PhotoAnalysis> {
  const response = await fetcher('/api/vocabulary/analyze-photo', {
    method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': photo.type }, body: photo, signal, cache: 'no-store',
  });
  const parsed: unknown = await response.json().catch(() => null);
  const data = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  if (!response.ok) {
    throw new Error(messages[typeof data?.code === 'string' ? data.code : ''] ?? (response.status === 401 ? 'Sign in again to analyze a photo.' : response.status === 429 ? 'Photo recognition has reached its usage limit. Please try again later.' : 'Photo analysis did not finish. Please try again or choose another photo.'));
  }
  const text = (value: unknown, max: number) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
  if (!data || !text(data.suggested_title, 80) || data.requires_review !== true || !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(String(data.cefr_level)) || !Array.isArray(data.items) || data.items.length > 15 ||
    !data.items.every((item: PhotoAnalysis['items'][number]) => item && text(item.english, 100) && text(item.spanish, 100) && (item.usage_note === null || text(item.usage_note, 240)))) {
    throw new Error('The word suggestions could not be read. Please try again.');
  }
  return data as PhotoAnalysis;
}
