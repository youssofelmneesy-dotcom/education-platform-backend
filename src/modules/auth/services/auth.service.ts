import bcrypt from "bcrypt";

import type { RegisterRequestDto, RegisterResponseDto } from "../dto/index.js";
import type { IAuthRepository, IAuthService } from "../interfaces/index.js";
import { AuthRepository } from "../repositories/index.js";
import { EmailAlreadyExistsError } from "../utils/index.js";

const PASSWORD_SALT_ROUNDS = 12;

export class AuthService implements IAuthService {
  constructor(private readonly authRepository: IAuthRepository = new AuthRepository()) {}

  async register(data: RegisterRequestDto): Promise<RegisterResponseDto> {
    const email = data.email.toLowerCase();
    const emailExists = await this.authRepository.existsByEmail(email);

    if (emailExists) {
      throw new EmailAlreadyExistsError();
    }

    const passwordHash = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);
    const user = await this.authRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      passwordHash,
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
