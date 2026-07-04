export class RoleNotFoundError extends Error {
  constructor() {
    super("Role not found");
    this.name = "RoleNotFoundError";
  }
}

export class DuplicateRoleNameError extends Error {
  constructor() {
    super("Role with this name already exists");
    this.name = "DuplicateRoleNameError";
  }
}
