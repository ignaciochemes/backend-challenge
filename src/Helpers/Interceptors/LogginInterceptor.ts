import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly _logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, params, query, ip, headers } = request;
        const userAgent = headers['user-agent'] || 'unknown';
        const sanitizedBody = this.sanitizeData(body);
        const sanitizedParams = this.sanitizeData(params);
        const sanitizedQuery = this.sanitizeData(query);
        const requestId = this.generateRequestId();
        request.requestId = requestId;
        const startTime = Date.now();
        this._logger.log(`[${requestId}] ${method} ${url} - Body: ${JSON.stringify(sanitizedBody)} - Params: ${JSON.stringify(sanitizedParams)} - Query: ${JSON.stringify(sanitizedQuery)} - IP: ${ip} - User Agent: ${userAgent}`);
        return next.handle().pipe(
            tap({
                next: (data) => {
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    this._logger.log(`[${requestId}] ${method} ${url} - Response time: ${responseTime}ms`);
                },
                error: (error) => {
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    this._logger.error(`[${requestId}] ${method} ${url} - Error: ${error.message} - Response time: ${responseTime}ms`);
                }
            })
        );
    }

    private sanitizeData(data: any): any {
        if (!data) return {};
        const sanitized = JSON.parse(JSON.stringify(data));
        const sensitiveFields = ['password', 'token', 'credit_card', 'creditCard', 'secret', 'apiKey', 'api_key'];
        const sanitizeObject = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            Object.keys(obj).forEach(key => {
                if (sensitiveFields.includes(key.toLowerCase())) {
                    obj[key] = '[REDACTED]';
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitizeObject(obj[key]);
                }
            });
        };
        sanitizeObject(sanitized);
        return sanitized;
    }

    private generateRequestId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}