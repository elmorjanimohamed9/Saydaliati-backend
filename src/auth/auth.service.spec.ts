import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@/mail/mail.service';
import { UserRole } from './interfaces/auth.interfaces';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('firebase-admin', () => ({
  auth: () => ({
    generateEmailVerificationLink: jest
      .fn()
      .mockResolvedValue('verification-link'),
    generatePasswordResetLink: jest.fn().mockResolvedValue('reset-link'),
  }),
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(),
    },
  },
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockFirebaseService = {
    auth: {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn(),
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: jest.fn().mockReturnValue({ role: UserRole.USER }),
        }),
        update: jest.fn(),
      }),
    }),
    getClientAuth: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({ email: 'test@example.com' }),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockFirebaseService.auth.createUser.mockResolvedValue({
        uid: 'test-uid',
        email: mockCredentials.email,
      });

      const result = await service.register(mockCredentials);

      expect(result).toEqual({
        message:
          'Registration successful! Please check your email for verification.',
      });
      expect(mockFirebaseService.auth.createUser).toHaveBeenCalledWith({
        email: mockCredentials.email,
        password: mockCredentials.password,
        displayName: mockCredentials.name,
      });
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockCredentials.email,
        'verification-link',
        mockCredentials.name,
      );
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUserData = {
        uid: '12345',
        emailVerified: true,
        email: credentials.email,
        displayName: 'Test User',
      };

      // Mock the Firebase auth client
      const mockAuth = {};
      mockFirebaseService.getClientAuth.mockReturnValue(mockAuth);

      // Mock the signInWithEmailAndPassword function
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: { uid: mockUserData.uid },
      });

      mockFirebaseService.auth.getUser.mockResolvedValue(mockUserData);

      const result = await service.login(credentials);

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        credentials.email,
        credentials.password,
      );

      expect(result).toEqual({
        token: 'mock-jwt-token',
        User: {
          email: credentials.email,
          name: mockUserData.displayName,
          role: UserRole.USER,
        },
      });
    });
  });

  describe('forgotPassword', () => {
    it('should send reset password email', async () => {
      const email = 'test@example.com';
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({
        displayName: 'Test User',
      });

      const result = await service.forgotPassword({ email });

      expect(result.message).toBe(
        'Password reset instructions have been sent to your email.',
      );
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        email,
        'reset-link',
        'Test User',
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto = {
        token: 'valid-token',
        newPassword: 'newPassword123',
      };

      const mockUserData = {
        uid: '12345',
        email: 'test@example.com',
      };

      mockFirebaseService.auth.getUserByEmail.mockResolvedValue(mockUserData);
      mockFirebaseService.auth.updateUser.mockResolvedValue({});

      const result = await service.resetPassword(resetPasswordDto);

      expect(result.message).toBe(
        'Password has been successfully reset. You can now login.',
      );
      expect(mockFirebaseService.auth.updateUser).toHaveBeenCalledWith(
        mockUserData.uid,
        { password: resetPasswordDto.newPassword },
      );
    });
  });
});
