import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { Partenaire } from './entities/partner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Partenaire])],
  controllers: [PartnersController],
  providers: [PartnersService],
})
export class PartnersModule {}
