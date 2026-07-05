export interface CreateCategoryRequestDto {
  name: string;
  description?: string | null;
  parentId?: string | null;
}
