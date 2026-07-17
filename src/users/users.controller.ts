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
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from './users.service';
import { CreateUtilisateurDto } from './dto/create-user.dto';
import { UpdateUtilisateurDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

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

  @Roles('admin')
  @Post()
  create(@Body() dto: CreateUtilisateurDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUtilisateurDto,
    @Request() req: { user: { userId: number; role: string } },
  ) {
    // Les utilisateurs ne peuvent modifier que leur propre profil
    // Les admins peuvent modifier n'importe quel profil
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      throw new Error('Vous ne pouvez modifier que votre propre profil');
    }
    return this.service.update(id, dto);
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: join('uploads', 'images'),
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const extension = extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(extension)) {
          callback(null, true);
        } else {
          callback(new Error('Type de fichier non autorisé'), false);
        }
      },
    }),
  )
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { userId: number; role: string } },
  ) {
    // Les utilisateurs ne peuvent modifier que leur propre avatar
    // Les admins peuvent modifier n'importe quel avatar
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      throw new Error('Vous ne pouvez modifier que votre propre avatar');
    }

    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    const avatarUrl = `/uploads/images/${file.filename}`;
    const updatedUser = await this.service.updateAvatar(id, avatarUrl);
    return updatedUser;
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}