import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import ResponseFormatter from "src/Helpers/Formatter/ResponseFormatter";
import { CreateTransferRequestDto } from "src/Models/Request/TransferController/CreateTransferRequestDto";
import { CompanyResponseDto } from "src/Models/Response/CompanyController/CompanyResponseDto";
import GenericResponse from "src/Models/Response/GenericResponse";
import { TransferResponseDto } from "src/Models/Response/TransferController/TransferResponseDto";
import { TransferService } from "src/Services/TransferService";

@Controller('transfers')
export class TransferController {
    constructor(private readonly _transferService: TransferService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createTransfer(
        @Body() data: CreateTransferRequestDto
    ): Promise<ResponseFormatter<GenericResponse>> {
        const response: GenericResponse = await this._transferService.createTransfer(data);
        return ResponseFormatter.create<GenericResponse>(response);
    };

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ResponseFormatter<TransferResponseDto[]>> {
        const response: TransferResponseDto[] = await this._transferService.findAll();
        return ResponseFormatter.create<TransferResponseDto[]>(response);
    };

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(
        @Param('id') id: string
    ): Promise<ResponseFormatter<TransferResponseDto>> {
        const response: TransferResponseDto = await this._transferService.findById(id);
        return ResponseFormatter.create<TransferResponseDto>(response);
    };

    @Get('company/:companyId')
    @HttpCode(HttpStatus.OK)
    async findByCompanyId(
        @Param('companyId') companyId: string
    ): Promise<ResponseFormatter<TransferResponseDto[]>> {
        const response: TransferResponseDto[] = await this._transferService.findByCompanyId(companyId);
        return ResponseFormatter.create<TransferResponseDto[]>(response);
    }

    @Get('companies/last-month')
    @HttpCode(HttpStatus.OK)
    async findCompaniesAdheringLastMonth(): Promise<ResponseFormatter<CompanyResponseDto[]>> {
        const response: CompanyResponseDto[] = await this._transferService.findCompaniesWithTransfersLastMonth();
        return ResponseFormatter.create<CompanyResponseDto[]>(response);
    }
}