import { Test, TestingModule } from '@nestjs/testing';
import { PharmacyService } from './pharmacy.service';
import { FirebaseService } from '../firebase/firebase.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePharmacyDto, PharmacyStatus } from './dto/create-pharmacy.dto';

describe('PharmacyService', () => {
  let service: PharmacyService;

  const mockFirebaseService = {
    collection: jest.fn(),
  };

  const mockPharmacyDoc = {
    id: 'test-id',
    exists: true,
    data: jest.fn(),
  };

  const mockPharmacyRef = {
    doc: jest.fn().mockReturnValue({
      id: 'test-id',
      set: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockResolvedValue(mockPharmacyDoc),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    }),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PharmacyService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<PharmacyService>(PharmacyService);
    mockFirebaseService.collection.mockReturnValue(mockPharmacyRef);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a pharmacy successfully', async () => {
      const createPharmacyDto: CreatePharmacyDto = {
        name: 'Test Pharmacy',
        address: 'Test Address',
        latitude: '123.456',
        longLatitude: '789.012',
        openHours: '09:00',
        closeHours: '18:00',
        image: 'http://test.com/image.jpg',
        phone: '+0987654321',
        status: PharmacyStatus.CLOSE,
      };

      const result = await service.create(createPharmacyDto);

      expect(result).toEqual({
        message: 'Pharmacy created successfully',
        pharmacyId: 'test-id',
      });
    });

    it('should throw BadRequestException on create failure', async () => {
      const createPharmacyDto: CreatePharmacyDto = {
        name: 'Test Pharmacy',
        address: 'Test Address',
        latitude: '123.456',
        longLatitude: '789.012',
        openHours: '09:00',
        closeHours: '18:00',
        image: 'http://test.com/image.jpg',
        phone: '+0987654321',
        status: PharmacyStatus.CLOSE,
      };

      mockPharmacyRef.doc().set.mockRejectedValue(new Error('Firebase error'));

      await expect(service.create(createPharmacyDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all pharmacies', async () => {
      const mockPharmacies = [
        { id: '1', name: 'Pharmacy 1' },
        { id: '2', name: 'Pharmacy 2' },
      ];

      mockPharmacyRef.get.mockResolvedValue({
        docs: mockPharmacies.map((pharmacy) => ({
          id: pharmacy.id,
          data: () => pharmacy,
        })),
      });

      const result = await service.findAll();
      expect(result).toEqual(
        mockPharmacies.map((pharmacy) => ({
          id: pharmacy.id,
          ...pharmacy,
        })),
      );
    });

    it('should throw BadRequestException on findAll failure', async () => {
      mockPharmacyRef.get.mockRejectedValue(new Error('Firebase error'));

      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a single pharmacy', async () => {
      const mockPharmacy = { id: '1', name: 'Test Pharmacy' };
      mockPharmacyDoc.data.mockReturnValue(mockPharmacy);

      const result = await service.findOne('1');
      expect(result).toEqual({
        id: '1',
        ...mockPharmacy,
      });
    });

    it('should throw BadRequestException when id is empty', async () => {
      await expect(service.findOne('')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      mockPharmacyDoc.exists = false;
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a pharmacy successfully', async () => {
      mockPharmacyDoc.exists = true;

      const result = await service.update('1', { name: 'Updated Pharmacy' });
      expect(result).toEqual({
        message: 'Pharmacy with ID 1 updated successfully',
      });
    });

    it('should throw BadRequestException when id is empty', async () => {
      await expect(service.update('', {})).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      mockPharmacyDoc.exists = false;
      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a pharmacy successfully', async () => {
      mockPharmacyDoc.exists = true;

      const result = await service.remove('1');
      expect(result).toEqual({
        message: 'Pharmacy with ID 1 deleted successfully',
      });
    });

    it('should throw BadRequestException when id is empty', async () => {
      await expect(service.remove('')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      mockPharmacyDoc.exists = false;
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update pharmacy status from close to open', async () => {
      mockPharmacyDoc.exists = true;
      mockPharmacyDoc.data.mockReturnValue({ status: 'close' });

      const result = await service.updateStatus('1');
      expect(result).toEqual({
        message: 'Pharmacy status updated to open',
      });
    });

    it('should update pharmacy status from open to close', async () => {
      mockPharmacyDoc.exists = true;
      mockPharmacyDoc.data.mockReturnValue({ status: 'open' });

      const result = await service.updateStatus('1');
      expect(result).toEqual({
        message: 'Pharmacy status updated to close',
      });
    });

    it('should throw BadRequestException when id is empty', async () => {
      await expect(service.updateStatus('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      mockPharmacyDoc.exists = false;
      await expect(service.updateStatus('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
