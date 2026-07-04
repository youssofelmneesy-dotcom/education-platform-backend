import type { IPermissionsRepository, IPermissionsService } from "../interfaces/index.js";
import { PermissionsRepository } from "../repositories/index.js";

export class PermissionsService implements IPermissionsService {
  constructor(private readonly permissionsRepository: IPermissionsRepository = new PermissionsRepository()) {
    void this.permissionsRepository;
  }
}
