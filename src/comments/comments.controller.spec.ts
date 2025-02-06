import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockCommentsService = {
    createComment: jest.fn(),
    getComments: jest.fn(),
    deleteComment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const createCommentDto: CreateCommentDto = {
        pharmacyId: 'pharmacy123',
        comment: 'Great service!',
        stars: 5,
      };
      const token = 'mock-token';
      const expectedResult = { id: 'comment123', ...createCommentDto };

      mockCommentsService.createComment.mockResolvedValue(expectedResult);

      const result = await controller.createComment(createCommentDto, token);

      expect(result).toEqual(expectedResult);
      expect(service.createComment).toHaveBeenCalledWith(
        createCommentDto,
        token,
      );
    });
  });

  describe('getComments', () => {
    it('should return comments for a pharmacy', async () => {
      const pharmacyId = 'pharmacy123';
      const expectedComments = [
        { id: 'comment1', content: 'Great!' },
        { id: 'comment2', content: 'Excellent!' },
      ];

      mockCommentsService.getComments.mockResolvedValue(expectedComments);

      const result = await controller.getComments(pharmacyId);

      expect(result).toEqual(expectedComments);
      expect(service.getComments).toHaveBeenCalledWith(pharmacyId);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const pharmacyId = 'pharmacy123';
      const commentId = 'comment123';
      const token = 'mock-token';
      const expectedResult = { success: true };

      mockCommentsService.deleteComment.mockResolvedValue(expectedResult);

      const result = await controller.deleteComment(
        pharmacyId,
        commentId,
        token,
      );

      expect(result).toEqual(expectedResult);
      expect(service.deleteComment).toHaveBeenCalledWith(
        pharmacyId,
        commentId,
        token,
      );
    });
  });
});
