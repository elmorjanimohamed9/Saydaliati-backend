import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class PharmacyService {
  private readonly logger = new Logger(PharmacyService.name);

  constructor(private firebaseService: FirebaseService) {}

  async create(createPharmacyDto: CreatePharmacyDto) {
    try {
      const pharmacyRef = this.firebaseService.collection('pharmacies').doc();
      await pharmacyRef.set({
        ...createPharmacyDto,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        message: 'Pharmacy created successfully',
        pharmacyId: pharmacyRef.id,
      };
    } catch (error) {
      this.logger.error('Failed to create pharmacy:', error);
      throw new BadRequestException('Failed to create pharmacy');
    }
  }

  async findAll() {
    try {
      const pharmacySnapshot = await this.firebaseService
        .collection('pharmacies')
        .get();
      return pharmacySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      this.logger.error('Failed to fetch pharmacies:', error);
      throw new BadRequestException('Failed to fetch pharmacies');
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Pharmacy ID is required');
      }

      const pharmacyDoc = await this.firebaseService
        .collection('pharmacies')
        .doc(id)
        .get();

      if (!pharmacyDoc.exists) {
        throw new NotFoundException('Pharmacy not found');
      }

      return { id: pharmacyDoc.id, ...pharmacyDoc.data() };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to fetch pharmacy with id ${id}:`, error);
      throw new BadRequestException(`Failed to fetch pharmacy with id ${id}`);
    }
  }

  async update(id: string, updatePharmacyDto: UpdatePharmacyDto) {
    try {
      if (!id) {
        throw new BadRequestException('Pharmacy ID is required');
      }

      const pharmacyRef = this.firebaseService.collection('pharmacies').doc(id);
      const pharmacyDoc = await pharmacyRef.get();

      if (!pharmacyDoc.exists) {
        throw new NotFoundException('Pharmacy not found');
      }

      await pharmacyRef.update({
        ...updatePharmacyDto,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { message: `Pharmacy with ID ${id} updated successfully` };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to update pharmacy with id ${id}:`, error);
      throw new BadRequestException('Failed to update pharmacy');
    }
  }

  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Pharmacy ID is required');
      }

      const pharmacyRef = this.firebaseService.collection('pharmacies').doc(id);
      const pharmacyDoc = await pharmacyRef.get();

      if (!pharmacyDoc.exists) {
        throw new NotFoundException('Pharmacy not found');
      }

      await pharmacyRef.delete();
      return { message: `Pharmacy with ID ${id} deleted successfully` };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to delete pharmacy with id ${id}:`, error);
      throw new BadRequestException('Failed to delete pharmacy');
    }
  }

  async updateStatus(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Pharmacy ID is required');
      }

      const pharmacyRef = this.firebaseService.collection('pharmacies').doc(id);
      const pharmacyDoc = await pharmacyRef.get();

      if (!pharmacyDoc.exists) {
        throw new NotFoundException('Pharmacy not found');
      }

      const pharmacyData = pharmacyDoc.data();
      const newStatus = pharmacyData.status === 'close' ? 'open' : 'close';
      await pharmacyRef.update({ status: newStatus });

      return { message: `Pharmacy status updated to ${newStatus}` };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to update pharmacy status:`, error);
      throw new BadRequestException('Failed to update pharmacy status');
    }
  }
}
