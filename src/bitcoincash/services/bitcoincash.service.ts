import { Injectable, Query } from '@nestjs/common';
import { CallrpcService } from '../../callrpc/callrpc.service';
import { RpcResponse, RpcResponseError } from 'jsonrpc-ts';
import { SendTransactionDto } from '../dto/send-transaction.dto';
import { BitcoinCashWalletEntity } from '../entities/bitcoin-cash-wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitcoinCashPendingTransactionEntity } from '../entities/bitcoin-cash-pending-transaction.entity';
import { BitcoinCashReceiveTransactionEntity } from '../entities/bitcoin-cash-receive-transaction.entity';
import { BitcoinCashSendTransactionEntity } from '../entities/bitcoin-cash-send-transaction.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckTransactionResponse } from '../interfaces/check-transaction.response';

@Injectable()
export class BitcoincashService {
  constructor(private callrpcService:CallrpcService,
              @InjectRepository(BitcoinCashWalletEntity) private bitcoinCashWalletRepo:Repository<BitcoinCashWalletEntity>,
              @InjectRepository(BitcoinCashPendingTransactionEntity) private bitcoinCashPendingTransactionRepo:Repository<BitcoinCashPendingTransactionEntity>,
              @InjectRepository(BitcoinCashReceiveTransactionEntity) private bitcoinCashReceiveTransactionRepo:Repository<BitcoinCashReceiveTransactionEntity>,
              @InjectRepository(BitcoinCashSendTransactionEntity) private bitcoinCashSendTransactionRepo:Repository<BitcoinCashSendTransactionEntity>)
  {}

  async walletNotify(@Query("transaction") transaction:any):Promise<any>
  {
    const checkTransaction:CheckTransactionResponse=await this.checkTransaction(transaction)
    if (checkTransaction.confirmations<1)
    {
      const transactionDetail=checkTransaction.details[0]
      if (transactionDetail.category=="receive")
      {
        const findPendingTransaction=await this.bitcoinCashPendingTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
        if (!findPendingTransaction)
        {
          const bitcoinCashPendingTransactionEntity=new BitcoinCashPendingTransactionEntity()
          bitcoinCashPendingTransactionEntity.account=transactionDetail.account
          bitcoinCashPendingTransactionEntity.address=transactionDetail.address
          bitcoinCashPendingTransactionEntity.amount=transactionDetail.amount
          bitcoinCashPendingTransactionEntity.category=transactionDetail.category
          bitcoinCashPendingTransactionEntity.confirmations=checkTransaction.confirmations
          bitcoinCashPendingTransactionEntity.label=transactionDetail.label
          bitcoinCashPendingTransactionEntity.receiveTime=checkTransaction.timereceived
          bitcoinCashPendingTransactionEntity.time=checkTransaction.time
          bitcoinCashPendingTransactionEntity.txid=checkTransaction.txid
          const saved=await this.bitcoinCashPendingTransactionRepo.save(bitcoinCashPendingTransactionEntity)
          console.log(`We gonna receive some Litecoin  txId: ${checkTransaction.txid}`);
        }
      }
      if (transactionDetail.category=="send")
      {
        const findPendingTransaction=await this.bitcoinCashPendingTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
        if (!findPendingTransaction)
        {
          const bitcoinCashPendingTransactionEntity=new BitcoinCashPendingTransactionEntity()
          bitcoinCashPendingTransactionEntity.account=transactionDetail.account
          bitcoinCashPendingTransactionEntity.address=transactionDetail.address
          bitcoinCashPendingTransactionEntity.amount=transactionDetail.amount
          bitcoinCashPendingTransactionEntity.category=transactionDetail.category
          bitcoinCashPendingTransactionEntity.confirmations=checkTransaction.confirmations
          bitcoinCashPendingTransactionEntity.label=transactionDetail.label
          bitcoinCashPendingTransactionEntity.receiveTime=checkTransaction.timereceived
          bitcoinCashPendingTransactionEntity.time=checkTransaction.time
          bitcoinCashPendingTransactionEntity.txid=checkTransaction.txid
          bitcoinCashPendingTransactionEntity.fee=transactionDetail.fee
          const savedPendingTransaction=await this.bitcoinCashPendingTransactionRepo.save(bitcoinCashPendingTransactionEntity)
          console.log(`We lose some Lite...!  txId: ${checkTransaction.txid}`);
        }
      }
    }
  }

  async getCoreBalance():Promise<any>
  {
    const method="getbalance"
    const params=[]
    const sendGetRequest=await this.callrpcService.bitcoinCashCallRpc(method,params)
    if (sendGetRequest.error)
      return sendGetRequest.error

    return sendGetRequest.result
  }

  async unlockWallet(master_pass:string):Promise<any>
  {
    const method=""
    const params=[`${master_pass}`,60]
    const sendUnlockRequest=await this.callrpcService.bitcoinCashCallRpc(method,params)
  }

  async sendTransaction(sendTransactionDto:SendTransactionDto):Promise<any>
  {
    const {amount,commentFrom,commentTo,subtractFee,targetWallet}=sendTransactionDto
    const method="sendtoaddress"
    const params=[`${targetWallet}`,amount, `${commentFrom}`,`${commentTo}`,subtractFee]
    const sendTransactionRequest=await this.callrpcService.bitcoinCashCallRpc(method,params)
    if (sendTransactionRequest.error)
      return sendTransactionRequest.error

    return sendTransactionRequest.result
  }

  async checkTransaction(txId:string):Promise<any>
  {
    const method="gettransaction"
    const params=[`${txId}`]
    const sendCheckRequest=await this.callrpcService.bitcoinCashCallRpc(method,params)
    if (sendCheckRequest.error)
      return sendCheckRequest.error

    return sendCheckRequest.result
  }

  async generateAddress():Promise<any>
  {
    const method="getnewaddress"
    const params=[]
    const sendGenerateRequest=await this.callrpcService.bitcoinCashCallRpc(method,params)

    const bitcoinCashWalletEntity=new BitcoinCashWalletEntity()
    bitcoinCashWalletEntity.address=sendGenerateRequest.result
    const savedWalletAddres=await this.bitcoinCashWalletRepo.save(bitcoinCashWalletEntity)

    return sendGenerateRequest.result
  }

  async dumpPrivateKey(address:string):Promise<any>
  {
    const method="dumpprivkey"
    const params=[`${address}`]
    const walletPass=await this.callrpcService.walletOptions()
    const unlockWallet=await this.unlockWallet(walletPass.target_wallet)
    const sendDumpRequest=await this.callrpcService.bitcoinCashCallRpc(method,params)
    if (sendDumpRequest.error)
      return sendDumpRequest.error

    return sendDumpRequest.result
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async transferBalanceToMaster()
  {
    const walletOptions=await this.callrpcService.walletOptions()
    const setBalanceForTransfer=2
    const getCoreWalletBalance=await this.getCoreBalance()
    if (getCoreWalletBalance<=setBalanceForTransfer)
      console.log(`Balance is not enough fo transfer to Master`);

    if (getCoreWalletBalance>setBalanceForTransfer)
    {
      const sendTransactionDto:SendTransactionDto=
        {
          targetWallet:walletOptions.target_wallet,
          subtractFee:true,
          commentTo:"",
          commentFrom:"",
          amount:getCoreWalletBalance
        }

      const sendTransactionToMasterWallet=await this.sendTransaction(sendTransactionDto)
      if (sendTransactionToMasterWallet.error)
        console.log(`Transfer to Master failed`);

      console.log(sendTransactionToMasterWallet.result);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkPendingTransactions()
  {
    const findPendingTransactions=await this.bitcoinCashPendingTransactionRepo.find()
    for (let pendingTransactions of findPendingTransactions) {
      const checkTransaction:CheckTransactionResponse=await this.checkTransaction(pendingTransactions.txid)

      if (checkTransaction.confirmations>0)
      {
        const transactionDetail=checkTransaction.details[0]
        if (transactionDetail.category=="receive")
        {
          const findReceivedTransaction=await this.bitcoinCashReceiveTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
          if (findReceivedTransaction)
          {
            findReceivedTransaction.confirmations=checkTransaction.confirmations
            const savedReceivedTransaction=await this.bitcoinCashReceiveTransactionRepo.save(findReceivedTransaction)
            console.log(`this Receive transaction confirmation goes up txId: ${checkTransaction.txid}`);
          }
          if (!findReceivedTransaction)
          {
            const bitcoinCashReceiveTransactionEntity=new BitcoinCashReceiveTransactionEntity()
            bitcoinCashReceiveTransactionEntity.account=transactionDetail.account
            bitcoinCashReceiveTransactionEntity.address=transactionDetail.address
            bitcoinCashReceiveTransactionEntity.amount=transactionDetail.amount
            bitcoinCashReceiveTransactionEntity.confirmations=checkTransaction.confirmations
            bitcoinCashReceiveTransactionEntity.label=transactionDetail.label
            bitcoinCashReceiveTransactionEntity.receiveTime=checkTransaction.timereceived
            bitcoinCashReceiveTransactionEntity.time=checkTransaction.time
            bitcoinCashReceiveTransactionEntity.txid=checkTransaction.txid
            const saveReceivedTransaction=await this.bitcoinCashReceiveTransactionRepo.save(bitcoinCashReceiveTransactionEntity)
            console.log(`This Transaction Received...!  txId: ${checkTransaction.txid}`);
          }
        }

        if (transactionDetail.category=="send")
        {
          const findSendTransaction=await this.bitcoinCashSendTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
          if (findSendTransaction)
          {
            findSendTransaction.confirmations=checkTransaction.confirmations
            const savedSendTransaction=await this.bitcoinCashSendTransactionRepo.save(findSendTransaction)
            console.log(`this send Transaction confirmation goes up  txId: ${checkTransaction.txid}`);
          }
          if (!findSendTransaction)
          {
            const bitcoinCashSendTransactionEntity=new BitcoinCashSendTransactionEntity()
            bitcoinCashSendTransactionEntity.address=transactionDetail.address
            bitcoinCashSendTransactionEntity.amount=transactionDetail.amount
            bitcoinCashSendTransactionEntity.category=transactionDetail.category
            bitcoinCashSendTransactionEntity.confirmations=checkTransaction.confirmations
            bitcoinCashSendTransactionEntity.fee=transactionDetail.fee
            bitcoinCashSendTransactionEntity.label=transactionDetail.label
            bitcoinCashSendTransactionEntity.receiveTime=checkTransaction.timereceived
            bitcoinCashSendTransactionEntity.time=checkTransaction.time
            bitcoinCashSendTransactionEntity.txid=checkTransaction.txid
            const saveSendTransaction=await this.bitcoinCashSendTransactionRepo.save(bitcoinCashSendTransactionEntity)
            console.log(`We lose some doge...!  txId: ${checkTransaction.txid}`);
          }
        }
      }
    }

  }
}
