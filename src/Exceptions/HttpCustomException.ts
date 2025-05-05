import { HttpException, HttpStatus } from '@nestjs/common';

export default class HttpCustomException extends HttpException {
    errors: any;

    constructor(
        message: any,
        statusCode: number,
        statusText?: string,
        errors?: any,
        httpCode: number = HttpStatus.BAD_REQUEST,
    ) {
        super(
            HttpException.createBody(message, HttpCustomException.getStatusText(statusText, statusCode), statusCode),
            httpCode,
        );
        this.errors = errors;
    }

    public static getStatusText(statusText: string, statusCode: number) {
        return statusText ? statusText : 'Bad Request';
    }

    public static createHttpCustomExceptionFromError(error: any): HttpCustomException {
        const message: any = error.response.data?.message;
        const statusText: string = error.response.data?.error;
        const statusCode: number = error.response.data?.statusCode;
        const httpCode: number = error.response.status;
        const errors: any = error.response.data?.errors;
        return new HttpCustomException(message, statusCode, statusText, errors, httpCode);
    }
}