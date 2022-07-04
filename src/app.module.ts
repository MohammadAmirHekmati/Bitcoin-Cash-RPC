import { Module } from '@nestjs/common';
import { CallrpcModule } from './callrpc/callrpc.module';
import { DatabaseModule } from './database/database.module';
import { BitcoincashModule } from './bitcoincash/bitcoincash.module';

@Module({
  imports: [CallrpcModule, DatabaseModule, BitcoincashModule]
})
export class AppModule {}
