import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly _logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;
        const startTime = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const endTime = Date.now();
                    this._logger.log(`${method} ${url} - ${endTime - startTime}ms`);
                },
                error: (error) => {
                    const endTime = Date.now();
                    this._logger.error(`${method} ${url} - Error: ${error.message} - ${endTime - startTime}ms`);
                }
            })
        );
    }
}