
import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm'
import {ColumnTypes} from "typeorm/metadata/types/ColumnTypes";

@Entity("users")
export class User {

  @PrimaryGeneratedColumn(ColumnTypes.INTEGER)
  id: number;
  @Column(ColumnTypes.STRING, {unique: true, nullable: false})
  username: string;
  @Column(ColumnTypes.STRING, {unique: true, nullable: true})
  name?: string;
  @Column(ColumnTypes.STRING, {nullable: false})
  email: string;
  @Column(ColumnTypes.STRING, {nullable: false})
  password_hash: string;
  @Column(ColumnTypes.STRING, {nullable: false})
  salt: string;
  @Column(ColumnTypes.BOOLEAN, {nullable: false})
  active: boolean;
  @Column(ColumnTypes.BOOLEAN, {nullable: false})
  admin: boolean;
  @Column(ColumnTypes.STRING, {nullable: true})
  avatar: string;
  @Column(ColumnTypes.STRING, {nullable: true})
  locale: string;
  @Column(ColumnTypes.STRING, {nullable: true})
  registration_ip_address: string;
  @Column(ColumnTypes.STRING, {nullable: true})
  ip_address: string;
  @Column(ColumnTypes.DATETIME, {nullable: true})
  created_at: Date;
  @Column(ColumnTypes.DATETIME, {nullable: true})
  updated_at: Date;
}


@Entity("tokens")
export class Token {

  @PrimaryColumn(ColumnTypes.STRING)
  key: string;
  @Column(ColumnTypes.STRING, {nullable: false})
  user_id: number;
  @Column(ColumnTypes.STRING, {nullable: false})
  type: string;
  @Column(ColumnTypes.STRING, {nullable: false})
  data: string;
}
