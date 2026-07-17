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
exports.UpdateRessourceHumaineDto = exports.CreateRessourceHumaineDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateRessourceHumaineDto {
    nom;
    prenom;
    poste;
    description;
    email;
    telephone;
    photo;
    actif;
    ordre;
}
exports.CreateRessourceHumaineDto = CreateRessourceHumaineDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Le nom ne peut pas dépasser 100 caractères' }),
    __metadata("design:type", String)
], CreateRessourceHumaineDto.prototype, "nom", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Le prénom doit contenir au moins 2 caractères' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Le prénom ne peut pas dépasser 100 caractères' }),
    __metadata("design:type", String)
], CreateRessourceHumaineDto.prototype, "prenom", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Le poste doit contenir au moins 2 caractères' }),
    (0, class_validator_1.MaxLength)(150, { message: 'Le poste ne peut pas dépasser 150 caractères' }),
    __metadata("design:type", String)
], CreateRessourceHumaineDto.prototype, "poste", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'La description ne peut pas dépasser 1000 caractères' }),
    __metadata("design:type", String)
], CreateRessourceHumaineDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Email invalide' }),
    (0, class_validator_1.MaxLength)(150, { message: "L'email ne peut pas dépasser 150 caractères" }),
    __metadata("design:type", String)
], CreateRessourceHumaineDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20, { message: 'Le téléphone ne peut pas dépasser 20 caractères' }),
    __metadata("design:type", String)
], CreateRessourceHumaineDto.prototype, "telephone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRessourceHumaineDto.prototype, "photo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRessourceHumaineDto.prototype, "actif", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: "L'ordre doit être un nombre entier" }),
    (0, class_validator_1.Min)(0, { message: "L'ordre ne peut pas être négatif" }),
    (0, class_validator_1.Max)(9999, { message: "L'ordre ne peut pas dépasser 9999" }),
    __metadata("design:type", Number)
], CreateRessourceHumaineDto.prototype, "ordre", void 0);
class UpdateRessourceHumaineDto {
    nom;
    prenom;
    poste;
    description;
    email;
    telephone;
    photo;
    actif;
    ordre;
}
exports.UpdateRessourceHumaineDto = UpdateRessourceHumaineDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Le nom ne peut pas dépasser 100 caractères' }),
    __metadata("design:type", String)
], UpdateRessourceHumaineDto.prototype, "nom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Le prénom doit contenir au moins 2 caractères' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Le prénom ne peut pas dépasser 100 caractères' }),
    __metadata("design:type", String)
], UpdateRessourceHumaineDto.prototype, "prenom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Le poste doit contenir au moins 2 caractères' }),
    (0, class_validator_1.MaxLength)(150, { message: 'Le poste ne peut pas dépasser 150 caractères' }),
    __metadata("design:type", String)
], UpdateRessourceHumaineDto.prototype, "poste", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'La description ne peut pas dépasser 1000 caractères' }),
    __metadata("design:type", String)
], UpdateRessourceHumaineDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Email invalide' }),
    (0, class_validator_1.MaxLength)(150, { message: "L'email ne peut pas dépasser 150 caractères" }),
    __metadata("design:type", String)
], UpdateRessourceHumaineDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20, { message: 'Le téléphone ne peut pas dépasser 20 caractères' }),
    __metadata("design:type", String)
], UpdateRessourceHumaineDto.prototype, "telephone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRessourceHumaineDto.prototype, "photo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRessourceHumaineDto.prototype, "actif", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: "L'ordre doit être un nombre entier" }),
    (0, class_validator_1.Min)(0, { message: "L'ordre ne peut pas être négatif" }),
    (0, class_validator_1.Max)(9999, { message: "L'ordre ne peut pas dépasser 9999" }),
    __metadata("design:type", Number)
], UpdateRessourceHumaineDto.prototype, "ordre", void 0);
//# sourceMappingURL=create-ressource-humaine.dto.js.map