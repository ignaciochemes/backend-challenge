import { IsNumberString, IsOptional } from "class-validator";

export class FindTransferQueryRequest {
    @IsOptional()
    @IsNumberString()
    readonly page?: number;

    @IsOptional()
    @IsNumberString()
    readonly limit?: number;
}