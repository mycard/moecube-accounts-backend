
import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm'
import {ColumnTypes} from "typeorm/metadata/types/ColumnTypes";
import * as path from 'path'

@Entity("users")
export class User {

  @PrimaryGeneratedColumn(ColumnTypes.INTEGER)
  id?: number;
  @Column(ColumnTypes.STRING, {unique: true, nullable: false})
  username: string;
  @Column(ColumnTypes.STRING, {nullable: true})
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
  avatar?: string;
  @Column(ColumnTypes.STRING, {nullable: false})
  locale: string;
  @Column(ColumnTypes.STRING, {nullable: false})
  registration_ip_address: string;
  @Column(ColumnTypes.STRING, {nullable: false})
  ip_address: string;
  @Column(ColumnTypes.DATETIME, {nullable: false})
  created_at: Date;
  @Column(ColumnTypes.DATETIME, {nullable: false})
  updated_at: Date;

  constructor(props: User) {
    Object.assign(this, props)
  }

  handleAvatar = () => {
    if(this.avatar) {
      if(this.avatar.substring(0,16) == '/uploads/default') {
        this.avatar = `https://ygobbs.com${this.avatar}`
      } else {
        this.avatar = path.join('https://r.my-card.in', this.avatar)
      }
    } else {
      this.avatar = 'https://r.my-card.in/accounts/images/default_avatar.jpg'
    }
  }
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

  constructor(props: Token) {
    Object.assign(this, props)
  }
}



export class SignIn {

  account: string;
  password: string;

  constructor(props: SignIn) {
    Object.assign(this, props)
  }
}


export interface SignUp {

  username: string;
  name: string;
  password: string;
  email: string;

}

