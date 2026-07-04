import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshRequestDto,
  RefreshResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  LogoutRequestDto,
} from "../dto/index.js";

export interface IAuthService {
  register(data: RegisterRequestDto): Promise<RegisterResponseDto>;
  login(data: LoginRequestDto): Promise<LoginResponseDto>;
  refresh(data: RefreshRequestDto): Promise<RefreshResponseDto>;
  logout(data: LogoutRequestDto): Promise<void>;
}
