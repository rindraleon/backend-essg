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
exports.Formation = void 0;
const typeorm_1 = require("typeorm");
const text_util_1 = require("../../common/utils/text.util");
let Formation = class Formation {
    id;
    slug;
    generateSlug() {
        if (this.titre && !this.slug) {
            this.slug = (0, text_util_1.slugify)(this.titre);
        }
    }
    domaine;
    titre;
    niveau;
    duree;
    description;
    objectifs;
    debouches;
    conditionsAcces;
    conditions;
    competences;
    modules;
    credits;
    responsable;
    email;
    programme;
    image;
    enVedette;
    creeLe;
    misAJourLe;
};
exports.Formation = Formation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Formation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Formation.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Formation.prototype, "generateSlug", null);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', default: '[]' }),
    __metadata("design:type", Array)
], Formation.prototype, "domaine", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Formation.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: 'Licence' }),
    __metadata("design:type", String)
], Formation.prototype, "niveau", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Formation.prototype, "duree", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Formation.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', default: '[]' }),
    __metadata("design:type", Array)
], Formation.prototype, "objectifs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', default: '[]' }),
    __metadata("design:type", Array)
], Formation.prototype, "debouches", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Formation.prototype, "conditionsAcces", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', default: '[]' }),
    __metadata("design:type", Array)
], Formation.prototype, "conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', default: '[]' }),
    __metadata("design:type", Array)
], Formation.prototype, "competences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', default: '[]' }),
    __metadata("design:type", Array)
], Formation.prototype, "modules", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 180 }),
    __metadata("design:type", Number)
], Formation.prototype, "credits", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Formation.prototype, "responsable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Formation.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', default: '[]' }),
    __metadata("design:type", Array)
], Formation.prototype, "programme", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '/images/hero-campus.jpg' }),
    __metadata("design:type", String)
], Formation.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Formation.prototype, "enVedette", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Formation.prototype, "creeLe", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Formation.prototype, "misAJourLe", void 0);
exports.Formation = Formation = __decorate([
    (0, typeorm_1.Entity)('formations')
], Formation);
//# sourceMappingURL=formation.entity.js.map