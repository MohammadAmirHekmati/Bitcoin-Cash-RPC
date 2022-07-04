import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

export class PostgresConfigration implements TypeOrmOptionsFactory{
  createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    // Your Databases Options
    const options:TypeOrmModuleOptions=
      {
        type:"postgres",
        host:"",
        port:5432,
        database:"bitcoincash",
        username:"postgres",
        password:"",
        autoLoadEntities:true,
        synchronize:true
      }
      return options
  }

}