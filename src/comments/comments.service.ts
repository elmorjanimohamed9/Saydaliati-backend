import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly authService: AuthService,
  ) {}

  async createComment(createCommentDto: CreateCommentDto, token: string) {
    const vltoken = token.split(' ')[1];
    const email = await this.authService.extractEmailFromToken(vltoken);

    const userRecord = await this.firebaseService.auth
      .getUserByEmail(email)
      .catch(() => {
        throw new NotFoundException('User Not Found');
      });

    const pharmacyRef = this.firebaseService
      .collection('pharmacies')
      .doc(createCommentDto.pharmacyId);

    const pharmacyDoc = await pharmacyRef.get();
    if (!pharmacyDoc.exists) {
      throw new NotFoundException('Pharmacy Not Found');
    }

    const commentRef = await pharmacyRef.collection('comments').add({
      userId: userRecord.uid,
      comment: createCommentDto.comment,
      stars: createCommentDto.stars,
      createdAt: new Date(),
    });

    return {
      message: 'Comment added successfully',
      commentId: commentRef.id,
    };
  }

  async getComments(pharmacyId: string) {
    const pharmacyRef = this.firebaseService
      .collection('pharmacies')
      .doc(pharmacyId);

    const pharmacyDoc = await pharmacyRef.get();
    if (!pharmacyDoc.exists) {
      throw new NotFoundException('Pharmacy Not Found');
    }

    const comments = await pharmacyRef.collection('comments').get();
    return comments.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async deleteComment(pharmacyId: string, commentId: string, token: string) {
    const vltoken = token.split(' ')[1];
    const email = await this.authService.extractEmailFromToken(vltoken);

    const userRecord = await this.firebaseService.auth
      .getUserByEmail(email)
      .catch(() => {
        throw new NotFoundException('User Not Found');
      });

    const commentRef = this.firebaseService
      .collection('pharmacies')
      .doc(pharmacyId)
      .collection('comments')
      .doc(commentId);

    const commentDoc = await commentRef.get();
    if (!commentDoc.exists) {
      throw new NotFoundException('Comment Not Found');
    }

    const commentData = commentDoc.data();
    if (commentData.userId !== userRecord.uid) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    await commentRef.delete();
    return { message: 'Comment deleted successfully' };
  }
}
