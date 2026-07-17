import { IsString, IsNumber, IsOptional, validateSync } from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';

class EnvironmentVariables {
  @IsString()
  @IsOptional()
  DB_HOST = 'localhost';

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  DB_PORT = 5432;

  @IsString()
  @IsOptional()
  DB_USERNAME = 'postgres';

  @IsString()
  @IsOptional()
  DB_PASSWORD = 'password';

  @IsString()
  @IsOptional()
  DB_NAME = 'essg';

  @IsString()
  @IsOptional()
  JWT_SECRET = 'essg-default-secret-key';

  @IsString()
  @IsOptional()
  JWT_EXPIRATION = '24h';

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  PORT = 3001;

  @IsString()
  @IsOptional()
  UPLOAD_DIR = 'public/uploads';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
