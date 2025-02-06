import { FirebaseService } from '@/firebase/firebase.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FavoritDto } from './dto/favorit.dto';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class FavoritService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly authService: AuthService,
  ) {}

  async addFavorit(favoritDto: FavoritDto, token: string): Promise<void> {
    try {
      const vltoken = token.split(' ')[1];
      const email = await this.authService.extractEmailFromToken(vltoken);

      const userRecord = await this.firebaseService.auth
        .getUserByEmail(email)
        .catch(() => {
          throw new NotFoundException('User Not Found');
        });

      const userRef = this.firebaseService
        .collection('users')
        .doc(userRecord.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new NotFoundException('User not found');
      }

      const userData = userDoc.data();
      const currentFavorites = userData.favorites || [];
      const newFavorite = favoritDto.favorites[0];

      if (!currentFavorites.includes(newFavorite)) {
        await userRef.update({
          favorites: [...currentFavorites, newFavorite],
        });
      } else {
        throw new BadRequestException('Item already in favorites');
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to add favorite: ' + error.message);
    }
  }

  async removeFavorit(favoritDto: FavoritDto, token: string): Promise<void> {
    try {
      const vltoken = token.split(' ')[1];
      const email = await this.authService.extractEmailFromToken(vltoken);

      const userRecord = await this.firebaseService.auth
        .getUserByEmail(email)
        .catch(() => {
          throw new NotFoundException('User Not Found');
        });

      const userRef = this.firebaseService
        .collection('users')
        .doc(userRecord.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new NotFoundException('User not found');
      }

      const userData = userDoc.data();
      const currentFavorites = userData.favorites || [];
      const favoriteToRemove = favoritDto.favorites[0];

      await userRef.update({
        favorites: currentFavorites.filter((id) => id !== favoriteToRemove),
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to remove favorite: ' + error.message,
      );
    }
  }
}
