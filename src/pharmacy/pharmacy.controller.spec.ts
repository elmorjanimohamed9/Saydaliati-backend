import { Test, TestingModule } from '@nestjs/testing';
import { PharmacyController } from './pharmacy.controller';
import { PharmacyService } from './pharmacy.service';
import { S3Service } from '../s3/s3.service';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { FirebaseService } from '@/firebase/firebase.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { UpdateStatusDto } from './dto/UpdateStatusDto.dto';
import { PharmacyStatus } from './dto/create-pharmacy.dto';

describe('PharmacyController', () => {
  let controller: PharmacyController;
  let pharmacyService: jest.Mocked<PharmacyService>;
  let s3Service: jest.Mocked<S3Service>;

  const mockPharmacyService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  const mockFirebaseService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PharmacyController],
      providers: [
        { provide: PharmacyService, useValue: mockPharmacyService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: FirebaseService, useValue: mockFirebaseService },
        Reflector,
        RolesGuard,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PharmacyController>(PharmacyController);
    pharmacyService = module.get(PharmacyService);
    s3Service = module.get(S3Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a pharmacy with an image', async () => {
      const createPharmacyDto: CreatePharmacyDto = {
        name: 'Test Pharmacy',
        address: 'Test Address',
        latitude: '123.456',
        longLatitude: '789.012',
        openHours: '09:00',
        closeHours: '18:00',
        phone: '1234567890',
        image: '',
        status: PharmacyStatus.CLOSE,
      };
      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      const imageUrl = 'https://test-url.com/image.jpg';

      s3Service.uploadFile.mockResolvedValue(imageUrl);
      pharmacyService.create.mockResolvedValue({
        message: 'Pharmacy created successfully',
        pharmacyId: 'test-id',
      });

      const result = await controller.create(createPharmacyDto, file);

      expect(s3Service.uploadFile).toHaveBeenCalledWith(file, 'pharmacies');
      expect(pharmacyService.create).toHaveBeenCalledWith({
        ...createPharmacyDto,
        image: imageUrl,
      });
      expect(result).toEqual({
        message: 'Pharmacy created successfully',
        pharmacyId: 'test-id',
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of pharmacies', async () => {
      const mockPharmacies = [
        { id: '1', name: 'Pharmacy 1' },
        { id: '2', name: 'Pharmacy 2' },
      ];
      pharmacyService.findAll.mockResolvedValue(mockPharmacies);

      const result = await controller.findAll();

      expect(result).toEqual(mockPharmacies);
      expect(pharmacyService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single pharmacy', async () => {
      const mockPharmacy = { id: '1', name: 'Pharmacy 1' };
      pharmacyService.findOne.mockResolvedValue(mockPharmacy);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockPharmacy);
      expect(pharmacyService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a pharmacy', async () => {
      const updatePharmacyDto: UpdatePharmacyDto = {
        name: 'Updated Pharmacy',
      };
      const mockResponse = { message: 'Pharmacy updated successfully' };
      pharmacyService.update.mockResolvedValue(mockResponse);

      const result = await controller.update('1', updatePharmacyDto);

      expect(result).toEqual(mockResponse);
      expect(pharmacyService.update).toHaveBeenCalledWith(
        '1',
        updatePharmacyDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a pharmacy', async () => {
      const mockResponse = { message: 'Pharmacy deleted successfully' };
      pharmacyService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove('1');

      expect(result).toEqual(mockResponse);
      expect(pharmacyService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('updateStatus', () => {
    it('should update pharmacy status', async () => {
      const updateStatusDto: UpdateStatusDto = { id: '1' };
      const mockResponse = { message: 'Pharmacy status updated to open' };
      pharmacyService.updateStatus.mockResolvedValue(mockResponse);

      const result = await controller.updateStatus(updateStatusDto);

      expect(result).toEqual(mockResponse);
      expect(pharmacyService.updateStatus).toHaveBeenCalledWith('1');
    });
  });
});
