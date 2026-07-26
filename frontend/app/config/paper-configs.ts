import type {
  PaperConfig,
  PaperOrientation,
} from '@/app/types/letter-editor';

export const PAPER_CONFIGS: Record<PaperOrientation, PaperConfig> = {
  portrait: {
    orientation: 'portrait',
    label: 'Giấy dọc',
    description: 'Phù hợp với thư dài, tâm sự và nội dung nhiều.',
    width: 210,
    height: 297,
    aspectRatio: 210 / 297,
  },
  landscape: {
    orientation: 'landscape',
    label: 'Giấy ngang',
    description: 'Phù hợp với thiệp, lời chúc và nội dung ngắn.',
    width: 297,
    height: 210,
    aspectRatio: 297 / 210,
  },
};

export const PAPER_ORIENTATIONS = Object.keys(
  PAPER_CONFIGS,
) as PaperOrientation[];

export function isPaperOrientation(
  value: unknown,
): value is PaperOrientation {
  return value === 'portrait' || value === 'landscape';
}
