import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ColumnTypes } from 'typeorm/metadata/types/ColumnTypes';
import { URL } from 'url';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn(ColumnTypes.INTEGER)
    id: number;
    @Column(ColumnTypes.STRING, { unique: true, nullable: false })
    username: string;
    @Column(ColumnTypes.STRING, { nullable: true })
    name?: string;
    @Column(ColumnTypes.STRING, { nullable: false })
    email: string;
    @Column(ColumnTypes.STRING, { nullable: false })
    password_hash: string;
    @Column(ColumnTypes.STRING, { nullable: false })
    salt: string;
    @Column(ColumnTypes.BOOLEAN, { nullable: false })
    active: boolean;
    @Column(ColumnTypes.BOOLEAN, { nullable: false })
    admin: boolean;
    @Column(ColumnTypes.STRING, { nullable: true })
    avatar?: string;
    @Column(ColumnTypes.STRING, { nullable: false })
    locale: string;
    @Column(ColumnTypes.STRING, { nullable: false })
    registration_ip_address: string;
    @Column(ColumnTypes.STRING, { nullable: false })
    ip_address: string;
    @CreateDateColumn({ nullable: false })
    created_at: Date;
    @UpdateDateColumn({ nullable: false })
    updated_at: Date;

    constructor(props: UserCreate) {
        Object.assign(this, props);
    }

    toJSON() {
        // 这儿是 TypeScript 缺个功能，this 不支持直接用 ... 展开，这里强制类型转换一下。
        // https://github.com/Microsoft/TypeScript/issues/10727
        return { ...<Object>this, avatar: this.avatarURL() };
    }

    avatarURL() {
        if (this.avatar) {
            let url: URL;
            if (this.avatar.substring(0, 16) == '/uploads/default') {
                url = new URL(this.avatar, 'https://ygobbs.com');
            } else {
                url = new URL(this.avatar, 'https://cdn01.moecube.com');
            }
            return url.toString();
        } else {
            return 'https://cdn01.moecube.com/accounts/default_avatar.jpg';
        }
    }
}

interface UserCreate {
    username: string;
    email: string;
    password_hash: string;
    salt: string;
    active: boolean;
    admin: boolean;
    locale: string;
    registration_ip_address: string;
    ip_address: string;
}

@Entity('tokens')
export class Token {

    @PrimaryColumn(ColumnTypes.STRING)
    key: string;
    @Column(ColumnTypes.STRING, { nullable: false })
    user_id: number;
    @Column(ColumnTypes.STRING, { nullable: false })
    type: string;
    @Column(ColumnTypes.STRING, { nullable: false })
    data: string;

    constructor(props: Token) {
        Object.assign(this, props);
    }
}


export class SignIn {

    account: string;
    password: string;

    constructor(props: SignIn) {
        Object.assign(this, props);
    }
}


export interface SignUp {

    username: string;
    name: string;
    password: string;
    email: string;

}

