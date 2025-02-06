import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthService } from '@/auth/auth.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockFirebaseService = {
    collection: jest.fn(),
    auth: {
      getUserByEmail: jest.fn(),
    },
  };

  const mockAuthService = {
    extractEmailFromToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
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

    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const createCommentDto = {
        comment: 'Test comment',
        pharmacyId: 'pharmacy123',
        stars: 5,
      };
      const token = 'Bearer test-token';

      mockAuthService.extractEmailFromToken.mockResolvedValue(
        'test@example.com',
      );
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({
        uid: 'user123',
      });

      const mockPharmacyDoc = { exists: true };
      const mockCommentRef = { id: 'comment123' };

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockPharmacyDoc),
          collection: jest.fn().mockReturnValue({
            add: jest.fn().mockResolvedValue(mockCommentRef),
          }),
        }),
      });

      const result = await service.createComment(createCommentDto, token);
      expect(result).toEqual({
        message: 'Comment added successfully',
        commentId: 'comment123',
      });
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      const createCommentDto = {
        comment: 'Test comment',
        pharmacyId: 'pharmacy123',
        stars: 5,
      };
      const token = 'Bearer test-token';

      mockAuthService.extractEmailFromToken.mockResolvedValue(
        'test@example.com',
      );
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({
        uid: 'user123',
      });

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ exists: false }),
        }),
      });

      await expect(
        service.createComment(createCommentDto, token),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getComments', () => {
    it('should return all comments for a pharmacy', async () => {
      const pharmacyId = 'pharmacy123';
      const mockComments = [
        { id: 'comment1', comment: 'Great!', stars: 5 },
        { id: 'comment2', comment: 'Good!', stars: 4 },
      ];

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ exists: true }),
          collection: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              docs: mockComments.map((comment) => ({
                id: comment.id,
                data: () => comment,
              })),
            }),
          }),
        }),
      });

      const result = await service.getComments(pharmacyId);
      expect(result).toEqual(mockComments);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment successfully', async () => {
      const pharmacyId = 'pharmacy123';
      const commentId = 'comment123';
      const token = 'Bearer test-token';
      const userId = 'user123';

      mockAuthService.extractEmailFromToken.mockResolvedValue(
        'test@example.com',
      );
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({
        uid: userId,
      });

      const mockCommentDoc = {
        exists: true,
        data: () => ({ userId }),
      };

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue(mockCommentDoc),
              delete: jest.fn().mockResolvedValue(true),
            }),
          }),
        }),
      });

      const result = await service.deleteComment(pharmacyId, commentId, token);
      expect(result).toEqual({ message: 'Comment deleted successfully' });
    });

    it('should throw ForbiddenException when user is not comment owner', async () => {
      const pharmacyId = 'pharmacy123';
      const commentId = 'comment123';
      const token = 'Bearer test-token';

      mockAuthService.extractEmailFromToken.mockResolvedValue(
        'test@example.com',
      );
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({
        uid: 'user123',
      });

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ userId: 'different-user' }),
              }),
            }),
          }),
        }),
      });

      await expect(
        service.deleteComment(pharmacyId, commentId, token),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
