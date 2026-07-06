export interface VideoRecord {
  id: string;
  tenantId: string;
  lessonId: string;
  title: string | null;
  sourceUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface VideoChapterRecord {
  id: string;
  tenantId: string;
  videoId: string;
  title: string;
  startSecond: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface VideoSubtitleRecord {
  id: string;
  tenantId: string;
  videoId: string;
  language: string;
  label: string | null;
  fileUrl: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
