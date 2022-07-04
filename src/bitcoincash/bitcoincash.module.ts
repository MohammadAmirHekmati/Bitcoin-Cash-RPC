import { Module } from '@nestjs/common';
import { BitcoincashService } from './services/bitcoincash.service';
import { BitcoincashController } from './controllers/bitcoincash.controller';
import { CallrpcService } from '../callrpc/callrpc.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BitcoinCashWalletEntity } from './entities/bitcoin-cash-wallet.entity';
import { BitcoinCashSendTransactionEntity } from './entities/bitcoin-cash-send-transaction.entity';
import { BitcoinCashReceiveTransactionEntity } from './entities/bitcoin-cash-receive-transaction.entity';
import { BitcoinCashPendingTransactionEntity } from './entities/bitcoin-cash-pending-transaction.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([BitcoinCashWalletEntity,BitcoinCashSendTransactionEntity,BitcoinCashReceiveTransactionEntity,BitcoinCashPendingTransactionEntity]),
    ScheduleModule.forRoot()],
  providers: [BitcoincashService,CallrpcService],
  controllers: [BitcoincashController]
})
export class BitcoincashModule {}
