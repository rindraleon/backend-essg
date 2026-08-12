"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const api_message_decorator_1 = require("../decorators/api-message.decorator");
function defaultMessage(statusCode) {
    switch (statusCode) {
        case common_1.HttpStatus.CREATED:
            return 'Ressource créée avec succès';
        case common_1.HttpStatus.NO_CONTENT:
            return 'Opération effectuée avec succès';
        default:
            return 'Données récupérées avec succès';
    }
}
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode ?? common_1.HttpStatus.OK;
        const handler = context.getHandler();
        const metadataMessage = Reflect.getMetadata(api_message_decorator_1.API_MESSAGE_KEY, handler);
        const message = metadataMessage ?? defaultMessage(statusCode);
        return next.handle().pipe((0, operators_1.map)((data) => ({
            statusCode,
            message,
            data: data ?? null,
        })));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);
//# sourceMappingURL=transform.interceptor.js.map