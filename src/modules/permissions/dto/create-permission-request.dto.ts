export interface CreatePermissionRequestDto {
  resource: string;
  action: string;
  description?: string | null;
}
