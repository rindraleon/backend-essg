import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import {
  CreatePartenaireDto,
  UpdatePartenaireDto,
} from './dto/create-partner.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadConfig } from './config/multer.config';

@Controller('partners')
export class PartnersController {
  constructor(private readonly service: PartnersService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationQueryDto) {
    return this.service.findAll(paginationDto);
  }

  @Get('search')
  search(@Query('q') query: string, @Query() paginationDto: PaginationQueryDto) {
    return this.service.search(query, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('logo', uploadConfig))
  create(
    @Body() dto: CreatePartenaireDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      dto.logo = `/uploads/images/${file.filename}`;
    }
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('logo', uploadConfig))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartenaireDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      dto.logo = `/uploads/images/${file.filename}`;
    }
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
