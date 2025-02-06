import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserCredentials } from './interfaces/auth.interfaces';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from './interfaces/auth.interfaces';
import { RegisterDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with credentials', async () => {
      const credentials: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const expectedResponse = {
        message:
          'Registration successful! Please check your email for verification.',
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(credentials);

      expect(result).toEqual(expectedResponse);
      expect(authService.register).toHaveBeenCalledWith(credentials);
    });
  });

  describe('login', () => {
    it('should call authService.login with credentials', async () => {
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResponse = {
        token: 'jwt-token',
        User: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(credentials);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(credentials);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with email', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };
      const expectedResponse = {
        message: 'Password reset instructions have been sent to your email.',
      };

      mockAuthService.forgotPassword.mockResolvedValue(expectedResponse);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
      );
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with token and new password', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'reset-token',
        newPassword: 'newpassword123',
      };
      const expectedResponse = {
        message: 'Password has been successfully reset. You can now login.',
      };

      mockAuthService.resetPassword.mockResolvedValue(expectedResponse);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
