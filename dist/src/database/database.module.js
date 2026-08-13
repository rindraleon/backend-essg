"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_perf_logger_1 = require("../common/logger/typeorm-perf.logger");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const isProduction = configService.get('NODE_ENV') === 'production';
                    const verboseSql = configService.get('PERF_SQL', 'false') === 'true';
                    return {
                        type: 'postgres',
                        host: configService.get('POSTGRES_HOST', 'localhost'),
                        port: configService.get('POSTGRES_PORT', 5432),
                        username: configService.get('POSTGRES_USER', 'postgres'),
                        password: configService.get('POSTGRES_PASSWORD', 'password'),
                        database: configService.get('POSTGRES_DB', 'essg'),
                        entities: [__dirname + '/../**/*.entity.{js,ts}'],
                        synchronize: !isProduction,
                        logger: new typeorm_perf_logger_1.TypeormPerfLogger(verboseSql && !isProduction),
                        logging: isProduction ? ['error'] : ['error', 'warn', 'schema'],
                        maxQueryExecutionTime: 200,
                    };
                },
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map