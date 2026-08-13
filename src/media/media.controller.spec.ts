import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Readable } from 'node:stream';
import { StorageService } from '../common/storage/storage.service';
import { MediaController } from './media.controller';

describe('MediaController', () => {
  let controller: MediaController;
  let storage: { getMetadata: jest.Mock; openStream: jest.Mock };

  beforeEach(async () => {
    storage = {
      getMetadata: jest.fn().mockResolvedValue({
        size: 4,
        contentType: 'image/png',
      }),
      openStream: jest.fn().mockResolvedValue(Readable.from([Buffer.from('data')])),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [{ provide: StorageService, useValue: storage }],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('rejects private admission objects', async () => {
    const res = { setHeader: jest.fn(), pipe: jest.fn() } as never;
    await expect(controller.serve('admissions', 'secret.pdf', res)).rejects.toThrow(NotFoundException);
    expect(storage.openStream).not.toHaveBeenCalled();
  });

  it('streams a public image', async () => {
    const res = {
      setHeader: jest.fn(),
    } as unknown as import('express').Response;
    const pipe = jest.fn();
    storage.openStream.mockResolvedValue({ pipe });

    await controller.serve('images', 'photo.png', res);
    expect(storage.getMetadata).toHaveBeenCalledWith('images/photo.png');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(pipe).toHaveBeenCalledWith(res);
  });
});
