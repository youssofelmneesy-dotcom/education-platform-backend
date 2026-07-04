import type { IProfilesRepository, IProfilesService } from "../interfaces/index.js";
import { ProfilesRepository } from "../repositories/index.js";

export class ProfilesService implements IProfilesService {
  constructor(private readonly profilesRepository: IProfilesRepository = new ProfilesRepository()) {
    void this.profilesRepository;
  }
}
