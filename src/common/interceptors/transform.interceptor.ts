import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_MESSAGE_KEY } from '../decorators/api-message.decorator';
import { ApiResponse } from '../interfaces/api-response.interface';

function defaultMessage(statusCode: number): string {
  switch (statusCode as HttpStatus) {
    case HttpStatus.CREATED:
      return 'Ressource créée avec succès';
    case HttpStatus.NO_CONTENT:
      return 'Opération effectuée avec succès';
    default:
      return 'Données récupérées avec succès';
  }
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode ?? HttpStatus.OK;
    const handler = context.getHandler();
    const metadataMessage = Reflect.getMetadata(API_MESSAGE_KEY, handler) as string | undefined;
    const message: string = metadataMessage ?? defaultMessage(statusCode);

    return next.handle().pipe(
      map((data: T) => ({
        statusCode,
        message,
        data: data ?? null,
      })),
    );
  }
}
