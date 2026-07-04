import type { IRolesRepository, IRolesService } from "../interfaces/index.js";
import { RolesRepository } from "../repositories/index.js";

export class RolesService implements IRolesService {
  constructor(private readonly rolesRepository: IRolesRepository = new RolesRepository()) {
    void this.rolesRepository;
  }
}
