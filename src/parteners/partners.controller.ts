import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { imageUploadOptions } from '../common/storage/multer.config';
import { StorageService } from '../common/storage/storage.service';
import { CreatePartenaireDto, UpdatePartenaireDto } from './dto/create-partner.dto';
import { PartnersService } from './partners.service';

@Controller('partners')
export class PartnersController {
  constructor(
    private readonly service: PartnersService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @ApiMessage('Partenaires récupérés')
  findAll(@Query() paginationDto: PaginationQueryDto) {
    return this.service.findAll(paginationDto);
  }

  @Get('search')
  @ApiMessage('Recherche effectuée')
  search(@Query('q') query: string, @Query() paginationDto: PaginationQueryDto) {
    return this.service.search(query, paginationDto);
  }

  @Get(':id')
  @ApiMessage('Partenaire récupéré')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('slug/:slug')
  @ApiMessage('Partenaire récupéré')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get('name/:nom')
  @ApiMessage('Partenaire récupéré')
  findByName(@Param('nom') nom: string) {
    return this.service.findByName(nom);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('Partenaire créé avec succès')
  @UseInterceptors(FileInterceptor('logo', imageUploadOptions))
  async create(@Body() dto: CreatePartenaireDto, @UploadedFile() file?: Express.Multer.File) {
    if (file) {
      const result = await this.storageService.upload(file.buffer, file.originalname, {
        mimetype: file.mimetype,
      });
      dto.logo = result.url;
    }
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiMessage('Partenaire mis à jour')
  @UseInterceptors(FileInterceptor('logo', imageUploadOptions))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartenaireDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const result = await this.storageService.upload(file.buffer, file.originalname, {
        mimetype: file.mimetype,
      });
      dto.logo = result.url;
    }
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiMessage('Partenaire supprimé')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
