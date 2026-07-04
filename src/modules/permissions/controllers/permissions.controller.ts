import type { IPermissionsController, IPermissionsService } from "../interfaces/index.js";
import { PermissionsService } from "../services/index.js";

export class PermissionsController implements IPermissionsController {
  constructor(private readonly permissionsService: IPermissionsService = new PermissionsService()) {
    void this.permissionsService;
  }
}
