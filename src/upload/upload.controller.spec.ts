import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let service: { uploadImage: jest.Mock };

  beforeEach(async () => {
    service = {
      uploadImage: jest.fn().mockResolvedValue({ url: '/uploads/x.png', filename: 'x.png' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: service }],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('throws BadRequestException when no file', async () => {
    await expect(controller.uploadImage(undefined)).rejects.toThrow(BadRequestException);
  });

  it('delegates upload to the service when a file is present', async () => {
    const file = {
      buffer: Buffer.from('x'),
      originalname: 'a.png',
      mimetype: 'image/png',
    } as Express.Multer.File;
    const result = await controller.uploadImage(file);
    expect(service.uploadImage).toHaveBeenCalledWith(file);
    expect(result.url).toContain('/uploads/');
  });
});
