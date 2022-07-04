import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { RpcClient, RpcClientOptions, RpcRequest, RpcResponse } from 'jsonrpc-ts';

@Injectable()
export class CallrpcService {

  async bitcoinCashRpcOptions():Promise<RpcClientOptions>
  {
    // Host address of your Bitcoin Cash Fullnode
    const HOST=""

    // Port address of your Bitcoin Cash Fullnode
    const PORT=123456

    const bitcoinCashRpcOptions:RpcClientOptions=
      {
        // Username and Password of your RPC Server
        auth:{username:"", password:""},
        url:`http://${HOST}:${PORT}`,
        timeout:60000,
        headers:{"content-type": "text/plain;"},
        method:"post"
      }
      return bitcoinCashRpcOptions
  }

  async walletOptions():Promise<WalletOptions>
  {
    const walletOptions:WalletOptions=
      {
        // The Target Wallet that want to collect balances 
        target_wallet:"",
        // Password of the wallet in your Fullode
        wallet_pass:""
      }

    return walletOptions
  }

  async bitcoinCashCallRpc(method:string,params:any[]):Promise<RpcResponse<any>>
  {
    const rpcOptions=await this.bitcoinCashRpcOptions()
    const rpcClient=new RpcClient(rpcOptions)
    const rpcRequest:RpcRequest<any>=
      {
        id:Math.floor(Math.random() * 99999 - 11111),
        jsonrpc:"2.0",
        method:method,
        params:params
      }
      const sendRequest=await rpcClient.makeRequest(rpcRequest)
    if (sendRequest.status!==HttpStatus.OK)
      throw new BadRequestException()

    return sendRequest.data
  }
}

export class WalletOptions {
  wallet_pass:string
  target_wallet:string
}