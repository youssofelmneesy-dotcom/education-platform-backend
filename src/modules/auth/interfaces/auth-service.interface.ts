import type { RegisterRequestDto, RegisterResponseDto } from "../dto/index.js";

export interface IAuthService {
  register(data: RegisterRequestDto): Promise<RegisterResponseDto>;
}
