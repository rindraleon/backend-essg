import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { documentUploadOptions } from '../common/storage/multer.config';
import { StorageService } from '../common/storage/storage.service';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';

interface AdmissionFiles {
  cv?: Express.Multer.File[];
  lettreMotivation?: Express.Multer.File[];
}

@Controller('admissions')
export class AdmissionsController {
  constructor(
    private readonly admissionsService: AdmissionsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('Candidature enregistrée avec succès')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cv', maxCount: 1 },
        { name: 'lettreMotivation', maxCount: 1 },
      ],
      documentUploadOptions,
    ),
  )
  async create(
    @Body() createAdmissionDto: CreateAdmissionDto,
    @UploadedFiles() files?: AdmissionFiles,
  ) {
    const cv = files?.cv?.[0];
    const lettre = files?.lettreMotivation?.[0];

    if (cv) {
      const result = await this.storageService.upload(cv.buffer, cv.originalname, {
        mimetype: cv.mimetype,
      });
      createAdmissionDto.cvPath = result.url;
    }
    if (lettre) {
      const result = await this.storageService.upload(lettre.buffer, lettre.originalname, {
        mimetype: lettre.mimetype,
      });
      createAdmissionDto.lettreMotivationPath = result.url;
    }

    return this.admissionsService.create(createAdmissionDto);
  }

  @Get()
  @ApiMessage('Candidatures récupérées')
  findAll() {
    return this.admissionsService.findAll();
  }

  @Get(':id')
  @ApiMessage('Candidature récupérée')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.admissionsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiMessage('Statut de la candidature mis à jour')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdmissionStatusDto: UpdateAdmissionStatusDto,
  ) {
    return this.admissionsService.updateStatus(id, updateAdmissionStatusDto);
  }

  @Delete(':id')
  @ApiMessage('Candidature supprimée')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.admissionsService.remove(id);
  }
}
