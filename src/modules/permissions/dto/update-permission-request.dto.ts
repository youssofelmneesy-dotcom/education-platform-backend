export interface UpdatePermissionRequestDto {
  resource?: string;
  action?: string;
  description?: string | null;
}
