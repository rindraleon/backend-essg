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
exports.RessourceHumaine = void 0;
const typeorm_1 = require("typeorm");
let RessourceHumaine = class RessourceHumaine {
    id;
    slug;
    nom;
    prenom;
    poste;
    description;
    email;
    telephone;
    photo;
    actif;
    ordre;
    creeLe;
    misAJourLe;
};
exports.RessourceHumaine = RessourceHumaine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RessourceHumaine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], RessourceHumaine.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RessourceHumaine.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RessourceHumaine.prototype, "prenom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RessourceHumaine.prototype, "poste", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RessourceHumaine.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RessourceHumaine.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RessourceHumaine.prototype, "telephone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RessourceHumaine.prototype, "photo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], RessourceHumaine.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], RessourceHumaine.prototype, "ordre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], RessourceHumaine.prototype, "creeLe", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], RessourceHumaine.prototype, "misAJourLe", void 0);
exports.RessourceHumaine = RessourceHumaine = __decorate([
    (0, typeorm_1.Entity)('ressources_humaines')
], RessourceHumaine);
//# sourceMappingURL=ressource-humaine.entity.js.map