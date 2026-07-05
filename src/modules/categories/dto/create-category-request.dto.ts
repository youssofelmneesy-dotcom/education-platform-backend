export interface CreateCategoryRequestDto {
  name: string;
  slug: string;
  description?: string | null;
}
