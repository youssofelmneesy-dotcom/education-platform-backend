export interface VideoSubtitleDto {
  id: string;
  videoId: string;
  language: string;
  label: string | null;
  fileUrl: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoSubtitleDto {
  language: string;
  label?: string | null;
  fileUrl: string;
  isDefault?: boolean;
}

export interface UpdateVideoSubtitleDto {
  language?: string;
  label?: string | null;
  fileUrl?: string;
  isDefault?: boolean;
}
