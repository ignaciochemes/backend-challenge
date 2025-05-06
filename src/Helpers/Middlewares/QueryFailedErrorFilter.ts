import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import ErrorResponse from 'src/Models/Response/ErrorResponse';

@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
    private readonly _logger = new Logger(QueryFailedErrorFilter.name);

    catch(exception: QueryFailedError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const request: Request = ctx.getRequest<Request>();
        const { message } = exception;
        const { name } = exception;
        const body: string = JSON.stringify(message);
        const headers: string = JSON.stringify(request.headers);
        const errorResponse: ErrorResponse = ErrorResponse.create(HttpStatus.UNPROCESSABLE_ENTITY, 'Internal server error', name);
        this._logger.error(`Error Query ${exception.query}`);
        this._logger.error(`Message Query error: ${exception.message}`);
        this._logger.error(`StatusCode: ${response.statusCode}. Body: ${body}. Headers: ${headers}`);
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
}