import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfigration } from './postgres.configration';

@Module({
  imports:[TypeOrmModule.forRootAsync({useClass:PostgresConfigration})]
})
export class DatabaseModule {}
