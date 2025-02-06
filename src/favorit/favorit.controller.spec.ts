import { Test, TestingModule } from '@nestjs/testing';
import { FavoritController } from './favorit.controller';
import { FavoritService } from './favorit.service';
import { FavoritDto } from './dto/favorit.dto';

describe('FavoritController', () => {
  let controller: FavoritController;

  const mockFavoritService = {
    addFavorit: jest.fn(),
    removeFavorit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritController],
      providers: [
        {
          provide: FavoritService,
          useValue: mockFavoritService,
        },
      ],
    }).compile();

    controller = module.get<FavoritController>(FavoritController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addFavorit', () => {
    it('should add a favorit successfully', async () => {
      const favoritDto: FavoritDto = {
        favorites: ['pharmacy123'],
      };
      const token = 'Bearer test-token';
      const expectedResult = { message: 'Favorit added successfully' };

      mockFavoritService.addFavorit.mockResolvedValue(expectedResult);

      const result = await controller.addFavorit(favoritDto, token);

      expect(result).toEqual(expectedResult);
      expect(mockFavoritService.addFavorit).toHaveBeenCalledWith(
        favoritDto,
        token,
      );
    });
  });

  describe('removeFavorit', () => {
    it('should remove a favorit successfully', async () => {
      const favoritDto: FavoritDto = {
        favorites: ['pharmacy123'],
      };
      const token = 'Bearer test-token';
      const expectedResult = { message: 'Favorit removed successfully' };

      mockFavoritService.removeFavorit.mockResolvedValue(expectedResult);

      const result = await controller.removeFavorit(favoritDto, token);

      expect(result).toEqual(expectedResult);
      expect(mockFavoritService.removeFavorit).toHaveBeenCalledWith(
        favoritDto,
        token,
      );
    });
  });
});
