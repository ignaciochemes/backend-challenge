import { HttpStatus } from '@nestjs/common';
import HttpCustomException from 'src/Exceptions/HttpCustomException';

describe('HttpCustomException', () => {
    describe('constructor', () => {
        it('should create an instance with all parameters', () => {
            const message = 'Test message';
            const statusCode = 10001;
            const statusText = 'Test status';
            const errors = { field: 'Test error' };
            const httpCode = HttpStatus.BAD_REQUEST;
            const exception = new HttpCustomException(message, statusCode, statusText, errors, httpCode);
            expect(exception.message).toBeDefined();
            expect(exception.errors).toEqual(errors);
            expect(exception.getStatus()).toBe(httpCode);
        });

        it('should create an instance with default httpCode', () => {
            const message = 'Test message';
            const statusCode = 10001;
            const statusText = 'Test status';
            const errors = { field: 'Test error' };
            const exception = new HttpCustomException(message, statusCode, statusText, errors);
            expect(exception.message).toBeDefined();
            expect(exception.errors).toEqual(errors);
            expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        });

        it('should create an instance without statusText', () => {
            const message = 'Test message';
            const statusCode = 10001;
            const errors = { field: 'Test error' };
            const httpCode = HttpStatus.BAD_REQUEST;
            const exception = new HttpCustomException(message, statusCode, undefined, errors, httpCode);
            expect(exception.message).toBeDefined();
            expect(exception.errors).toEqual(errors);
            expect(exception.getStatus()).toBe(httpCode);
        });
    });

    describe('getStatusText', () => {
        it('should return provided statusText', () => {
            const statusText = 'Test status';
            const statusCode = 10001;
            const result = HttpCustomException.getStatusText(statusText, statusCode);
            expect(result).toBe(statusText);
        });

        it('should return default text when statusText is not provided', () => {
            const statusCode = 10001;
            const result = HttpCustomException.getStatusText(null, statusCode);
            expect(result).toBe('Bad Request');
        });
    });

    describe('createHttpCustomExceptionFromError', () => {
        it('should create an exception from error object', () => {
            const error = {
                response: {
                    data: {
                        message: 'Test message',
                        error: 'Test error',
                        statusCode: 10001,
                        errors: { field: 'Test error' }
                    },
                    status: HttpStatus.BAD_REQUEST
                }
            };
            const exception = HttpCustomException.createHttpCustomExceptionFromError(error);
            expect(exception).toBeInstanceOf(HttpCustomException);
            expect(exception.errors).toEqual(error.response.data.errors);
            expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        });
    });
});