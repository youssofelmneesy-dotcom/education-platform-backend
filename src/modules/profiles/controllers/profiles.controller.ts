import type { IProfilesController, IProfilesService } from "../interfaces/index.js";
import { ProfilesService } from "../services/index.js";

export class ProfilesController implements IProfilesController {
  constructor(private readonly profilesService: IProfilesService = new ProfilesService()) {
    void this.profilesService;
  }
}
