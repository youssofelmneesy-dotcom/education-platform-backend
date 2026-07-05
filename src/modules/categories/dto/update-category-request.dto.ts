export interface UpdateCategoryRequestDto {
  name?: string;
  description?: string | null;
  parentId?: string | null;
}
