export interface VideoChapterDto {
  id: string;
  videoId: string;
  title: string;
  startSecond: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoChapterDto {
  title: string;
  startSecond: number;
  sortOrder?: number;
}

export interface UpdateVideoChapterDto {
  title?: string;
  startSecond?: number;
  sortOrder?: number;
}
