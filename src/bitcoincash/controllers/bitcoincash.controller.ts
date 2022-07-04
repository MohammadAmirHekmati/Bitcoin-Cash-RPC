import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BitcoincashService } from '../services/bitcoincash.service';
import { SendTransactionDto } from '../dto/send-transaction.dto';

@Controller('bitcoincash')
export class BitcoincashController {
  constructor(private bitcoiCashService:BitcoincashService)
  {}

  @Get("wallet/notify")
  async walletNotify(@Query("transaction") transaction:any):Promise<any>
  {
    return await this.bitcoiCashService.walletNotify(transaction)
  }

  @Get("core/balance")
  async getCoreWalletBalance():Promise<any>
  {
    return await this.bitcoiCashService.getCoreBalance()
  }

  @Post("send/transaction")
  async sendTransaction(@Body() sendTransactionDto:SendTransactionDto):Promise<any>
  {
    return await this.bitcoiCashService.sendTransaction(sendTransactionDto)
  }

  @Get("check/transaction/:txId")
  async checkTransaction(@Param("txId") txId:string):Promise<any>
  {
    return await this.bitcoiCashService.checkTransaction(txId)
  }

  @Get("generate/new/address")
  async generateNewAddress():Promise<any>
  {
    return await this.bitcoiCashService.generateAddress()
  }

  @Get("dump/private/key/:address")
  async dumpPrivateKey(@Param("address") address:string):Promise<any>
  {
    return await this.bitcoiCashService.dumpPrivateKey(address)
  }
}
