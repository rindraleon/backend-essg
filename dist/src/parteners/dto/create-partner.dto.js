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
exports.UpdatePartenaireDto = exports.CreatePartenaireDto = void 0;
const class_validator_1 = require("class-validator");
class CreatePartenaireDto {
    nom = '';
    type = 'Entreprise';
    secteur = '';
    description = '';
    siteWeb;
    logo = '🤝';
    contact;
    dateDebut = new Date().toISOString().split('T')[0];
}
exports.CreatePartenaireDto = CreatePartenaireDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartenaireDto.prototype, "nom", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['Entreprise', 'Institution', 'Organisation', 'Autre']),
    __metadata("design:type", String)
], CreatePartenaireDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartenaireDto.prototype, "secteur", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartenaireDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePartenaireDto.prototype, "siteWeb", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePartenaireDto.prototype, "logo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePartenaireDto.prototype, "contact", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePartenaireDto.prototype, "dateDebut", void 0);
class UpdatePartenaireDto extends CreatePartenaireDto {
}
exports.UpdatePartenaireDto = UpdatePartenaireDto;
//# sourceMappingURL=create-partner.dto.js.map