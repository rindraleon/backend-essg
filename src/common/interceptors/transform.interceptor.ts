import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<ExpressResponse>();
    const statusCode = response.statusCode ?? 200;

    return next.handle().pipe(
      map((data: T) => ({
        data,
        statusCode,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
