import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { imageUploadOptions } from '../common/storage/multer.config';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('Image téléversée avec succès')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    return this.uploadService.uploadImage(file);
  }
}
