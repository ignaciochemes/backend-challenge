import { HttpStatus } from '@nestjs/common';
import ErrorResponse from 'src/Models/Response/ErrorResponse';

describe('ErrorResponse', () => {
    describe('constructor', () => {
        it('should create an instance with provided values', () => {
            const statusCode = HttpStatus.BAD_REQUEST;
            const message = 'Bad Request';
            const error = 'Validation failed';
            const errorResponse = new ErrorResponse(statusCode, message, error);
            expect(errorResponse.statusCode).toBe(statusCode);
            expect(errorResponse.message).toBe(message);
            expect(errorResponse.error).toBe(error);
        });
    });

    describe('create', () => {
        it('should create an instance using static method', () => {
            const statusCode = HttpStatus.BAD_REQUEST;
            const message = 'Bad Request';
            const error = 'Validation failed';
            const errorResponse = ErrorResponse.create(statusCode, message, error);
            expect(errorResponse).toBeInstanceOf(ErrorResponse);
            expect(errorResponse.statusCode).toBe(statusCode);
            expect(errorResponse.message).toBe(message);
            expect(errorResponse.error).toBe(error);
        });
    });
});