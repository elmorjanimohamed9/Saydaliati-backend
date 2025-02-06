import { Test, TestingModule } from '@nestjs/testing';
import { FavoritService } from './favorit.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthService } from '@/auth/auth.service';
import { FavoritDto } from './dto/favorit.dto';
import { NotFoundException } from '@nestjs/common';

describe('FavoritService', () => {
  let service: FavoritService;

  const mockFirebaseService = {
    auth: {
      getUserByEmail: jest.fn(),
    },
    collection: jest.fn(),
  };

  const mockAuthService = {
    extractEmailFromToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<FavoritService>(FavoritService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addFavorit', () => {
    it('should add a favorite successfully', async () => {
      const favoritDto: FavoritDto = {
        favorites: ['pharmacy123'],
      };
      const token = 'Bearer test-token';
      const mockUserData = {
        favorites: ['existing1'],
      };

      mockAuthService.extractEmailFromToken.mockResolvedValue(
        'test@example.com',
      );
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({
        uid: 'user123',
      });

      const mockUserDoc = {
        exists: true,
        data: () => mockUserData,
      };

      const mockUserRef = {
        get: jest.fn().mockResolvedValue(mockUserDoc),
        update: jest.fn().mockResolvedValue(true),
      };

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockUserRef),
      });

      await service.addFavorit(favoritDto, token);

      expect(mockUserRef.update).toHaveBeenCalledWith({
        favorites: ['existing1', 'pharmacy123'],
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const favoritDto: FavoritDto = {
        favorites: ['pharmacy123'],
      };
      const token = 'Bearer test-token';

      mockAuthService.extractEmailFromToken.mockResolvedValue(
        'test@example.com',
      );
      mockFirebaseService.auth.getUserByEmail.mockRejectedValue(
        new Error('User Not Found'),
      );

      await expect(service.addFavorit(favoritDto, token)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeFavorit', () => {
    it('should remove a favorite successfully', async () => {
      const favoritDto: FavoritDto = {
        favorites: ['pharmacy123'],
      };
      const token = 'Bearer test-token';
      const mockUserData = {
        favorites: ['pharmacy123', 'pharmacy456'],
      };

      mockAuthService.extractEmailFromToken.mockResolvedValue(
        'test@example.com',
      );
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({
        uid: 'user123',
      });

      const mockUserDoc = {
        exists: true,
        data: () => mockUserData,
      };

      const mockUserRef = {
        get: jest.fn().mockResolvedValue(mockUserDoc),
        update: jest.fn().mockResolvedValue(true),
      };

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockUserRef),
      });

      await service.removeFavorit(favoritDto, token);

      expect(mockUserRef.update).toHaveBeenCalledWith({
        favorites: ['pharmacy456'],
      });
    });
  });
});
