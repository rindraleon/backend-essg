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
exports.UpdateAdmissionStatusDto = void 0;
const class_validator_1 = require("class-validator");
const admission_entity_1 = require("../entities/admission.entity");
class UpdateAdmissionStatusDto {
    statut;
    commentaire;
    reponseDate;
    reponseHeure;
    reponseLieu;
    reponseInstructions;
    reponseMessage;
}
exports.UpdateAdmissionStatusDto = UpdateAdmissionStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(admission_entity_1.AdmissionStatus),
    __metadata("design:type", String)
], UpdateAdmissionStatusDto.prototype, "statut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], UpdateAdmissionStatusDto.prototype, "commentaire", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, { message: 'La date doit être au format AAAA-MM-JJ' }),
    __metadata("design:type", String)
], UpdateAdmissionStatusDto.prototype, "reponseDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: "L'heure doit être au format HH:MM" }),
    __metadata("design:type", String)
], UpdateAdmissionStatusDto.prototype, "reponseHeure", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateAdmissionStatusDto.prototype, "reponseLieu", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], UpdateAdmissionStatusDto.prototype, "reponseInstructions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], UpdateAdmissionStatusDto.prototype, "reponseMessage", void 0);
//# sourceMappingURL=update-admission-status.dto.js.map