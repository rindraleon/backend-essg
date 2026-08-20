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
exports.CreateAdmissionDto = void 0;
const class_validator_1 = require("class-validator");
const contact_validators_1 = require("../../common/validators/contact.validators");
const admission_entity_1 = require("../entities/admission.entity");
class CreateAdmissionDto {
    nom;
    prenom;
    email;
    telephone;
    dateNaissance;
    niveau;
    formation;
    diplomePrecedent;
    cvPath;
    lettreMotivationPath;
    statut;
    commentaire;
}
exports.CreateAdmissionDto = CreateAdmissionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "nom", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "prenom", void 0);
__decorate([
    (0, contact_validators_1.IsValidEmail)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "email", void 0);
__decorate([
    (0, contact_validators_1.IsValidPhoneOptional)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "telephone", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "dateNaissance", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "niveau", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "formation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "diplomePrecedent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "cvPath", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "lettreMotivationPath", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(admission_entity_1.AdmissionStatus),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "statut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateAdmissionDto.prototype, "commentaire", void 0);
//# sourceMappingURL=create-admission.dto.js.map