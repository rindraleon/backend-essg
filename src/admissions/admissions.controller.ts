import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';

@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cv', maxCount: 1 },
      { name: 'lettreMotivation', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createAdmissionDto: CreateAdmissionDto,
    @UploadedFiles() files: { cv?: Express.Multer.File; lettreMotivation?: Express.Multer.File },
  ) {
    if (files.cv) {
      createAdmissionDto.cvPath = `/uploads/${files.cv.filename}`;
    }
    if (files.lettreMotivation) {
      createAdmissionDto.lettreMotivationPath = `/uploads/${files.lettreMotivation.filename}`;
    }
    return this.admissionsService.create(createAdmissionDto);
  }

  @Get()
  findAll() {
    return this.admissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.admissionsService.findOne(+id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateAdmissionStatusDto: UpdateAdmissionStatusDto,
  ) {
    return this.admissionsService.updateStatus(+id, updateAdmissionStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.admissionsService.remove(+id);
  }
}
