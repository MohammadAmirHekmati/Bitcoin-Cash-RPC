import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name:"crypto_bitcoin_cash_wallet"})
export class BitcoinCashWalletEntity {
  @PrimaryGeneratedColumn("uuid")
  id:string

  @Column()
  address:string

  @CreateDateColumn()
  createAt:Date
}