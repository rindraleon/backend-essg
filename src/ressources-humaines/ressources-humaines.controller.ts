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
} from '@nestjs/common';
import { RessourcesHumainesService } from './ressources-humaines.service';
import { CreateRessourceHumaineDto, UpdateRessourceHumaineDto } from './dto/create-ressource-humaine.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('ressources-humaines')
export class RessourcesHumainesController {
  constructor(private readonly service: RessourcesHumainesService) {}

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
  create(@Body() dto: CreateRessourceHumaineDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRessourceHumaineDto,
  ) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}