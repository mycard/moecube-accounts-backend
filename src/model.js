"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const ColumnTypes_1 = require("typeorm/metadata/types/ColumnTypes");
const path = require("path");
let User = class User {
    constructor(props) {
        this.handleAvatar = () => {
            if (this.avatar) {
                if (this.avatar.substring(0, 16) == '/uploads/default') {
                    this.avatar = `https://ygobbs.com${this.avatar}`;
                }
                else {
                    this.avatar = path.join('https://r.my-card.in', this.avatar);
                }
            }
            else {
                this.avatar = 'https://r.my-card.in/accounts/images/default_avatar.jpg';
            }
        };
        Object.assign(this, props);
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(ColumnTypes_1.ColumnTypes.INTEGER),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: false }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: false }),
    __metadata("design:type", String)
], User.prototype, "password_hash", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: false }),
    __metadata("design:type", String)
], User.prototype, "salt", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.BOOLEAN, { nullable: false }),
    __metadata("design:type", Boolean)
], User.prototype, "active", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.BOOLEAN, { nullable: false }),
    __metadata("design:type", Boolean)
], User.prototype, "admin", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: false }),
    __metadata("design:type", String)
], User.prototype, "locale", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: false }),
    __metadata("design:type", String)
], User.prototype, "registration_ip_address", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: false }),
    __metadata("design:type", String)
], User.prototype, "ip_address", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.DATETIME, { nullable: false }),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.DATETIME, { nullable: false }),
    __metadata("design:type", Date)
], User.prototype, "updated_at", void 0);
User = __decorate([
    typeorm_1.Entity("users"),
    __metadata("design:paramtypes", [User])
], User);
exports.User = User;
let Token = class Token {
    constructor(props) {
        Object.assign(this, props);
    }
};
__decorate([
    typeorm_1.PrimaryColumn(ColumnTypes_1.ColumnTypes.STRING),
    __metadata("design:type", String)
], Token.prototype, "key", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: false }),
    __metadata("design:type", Number)
], Token.prototype, "user_id", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: false }),
    __metadata("design:type", String)
], Token.prototype, "type", void 0);
__decorate([
    typeorm_1.Column(ColumnTypes_1.ColumnTypes.STRING, { nullable: false }),
    __metadata("design:type", String)
], Token.prototype, "data", void 0);
Token = __decorate([
    typeorm_1.Entity("tokens"),
    __metadata("design:paramtypes", [Token])
], Token);
exports.Token = Token;
class SignIn {
    constructor(props) {
        Object.assign(this, props);
    }
}
exports.SignIn = SignIn;
//# sourceMappingURL=model.js.map