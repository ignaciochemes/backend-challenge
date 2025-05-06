import GenericResponse from "src/Models/Response/GenericResponse";

describe('GenericResponse', () => {
    describe('constructor', () => {
        it('should create an instance with provided message', () => {
            const message = 'Operation completed successfully';
            const response = new GenericResponse(message);
            expect(response.message).toBe(message);
        });
    });
});