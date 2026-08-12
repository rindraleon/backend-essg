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
  UseGuards,
} from '@nestjs/common';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get()
  @ApiMessage('Messages récupérés')
  findAll(@Query() paginationDto: PaginationQueryDto) {
    return this.service.findAll(paginationDto);
  }

  @Get('search')
  @ApiMessage('Recherche effectuée')
  search(@Query('q') query: string, @Query() paginationDto: PaginationQueryDto) {
    return this.service.search(query, paginationDto);
  }

  @Get(':id')
  @ApiMessage('Message récupéré')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('Message créé avec succès')
  create(@Body() dto: CreateMessageDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiMessage('Message mis à jour')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMessageDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiMessage('Message supprimé')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
