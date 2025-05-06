import ResponseFormatter from "src/Helpers/Formatter/ResponseFormatter";

describe('ResponseFormatter', () => {
    describe('constructor', () => {
        it('should create an instance with provided response', () => {
            const response = { data: 'test' };
            const formatter = new ResponseFormatter(response);
            expect(formatter.result).toBe(response);
        });
    });

    describe('create', () => {
        it('should create an instance using static method', () => {
            const response = { data: 'test' };
            const formatter = ResponseFormatter.create(response);
            expect(formatter).toBeInstanceOf(ResponseFormatter);
            expect(formatter.result).toBe(response);
        });
    });
});