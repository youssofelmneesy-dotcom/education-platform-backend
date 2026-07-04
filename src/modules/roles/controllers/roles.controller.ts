import type { IRolesController, IRolesService } from "../interfaces/index.js";
import { RolesService } from "../services/index.js";

export class RolesController implements IRolesController {
  constructor(private readonly rolesService: IRolesService = new RolesService()) {
    void this.rolesService;
  }
}
