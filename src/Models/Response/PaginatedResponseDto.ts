import { IPaginationMetadata } from "src/Interfaces/PaginationMetadata";

export class PaginatedResponseDto<T> {
    data: T[];
    pagination: IPaginationMetadata;

    constructor(data: T[], pagination: IPaginationMetadata) {
        this.data = data;
        this.pagination = pagination;
    }
}