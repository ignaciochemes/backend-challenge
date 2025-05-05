export default class ResponseFormatter<T> {
    result: T;

    constructor(response: T) {
        this.result = response;
    }

    public static create<T>(response: T): ResponseFormatter<T> {
        return new ResponseFormatter<T>(response);
    }
}