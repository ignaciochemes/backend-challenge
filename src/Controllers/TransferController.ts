import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import ResponseFormatter from "src/Helpers/Formatter/ResponseFormatter";
import { LoggingInterceptor } from "src/Helpers/Interceptors/LogginInterceptor";
import { CreateTransferRequestDto } from "src/Models/Request/TransferController/CreateTransferRequestDto";
import { FindTransferQueryRequest } from "src/Models/Request/TransferController/FindTransferQueryRequest";
import { CompanyResponseDto } from "src/Models/Response/CompanyController/CompanyResponseDto";
import GenericResponse from "src/Models/Response/GenericResponse";
import { PaginatedResponseDto } from "src/Models/Response/PaginatedResponseDto";
import { TransferResponseDto } from "src/Models/Response/TransferController/TransferResponseDto";
import { TransferService } from "src/Services/TransferService";

@ApiTags('transfers')
@Controller('transfers')
@UseInterceptors(LoggingInterceptor)
export class TransferController {
    constructor(private readonly _transferService: TransferService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiOperation({ summary: 'Create a new transfer' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Transfer created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
    @ApiBody({ type: CreateTransferRequestDto })
    @ApiResponse({ type: GenericResponse })
    async createTransfer(
        @Body() data: CreateTransferRequestDto
    ): Promise<ResponseFormatter<GenericResponse>> {
        const response: GenericResponse = await this._transferService.createTransfer(data);
        return ResponseFormatter.create<GenericResponse>(response);
    };

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all transfers with pagination' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 0)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Transfers retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No transfers found' })
    @ApiResponse({ type: TransferResponseDto, isArray: true })
    async findAll(
        @Query() query: FindTransferQueryRequest,
    ): Promise<ResponseFormatter<PaginatedResponseDto<TransferResponseDto>>> {
        const response = await this._transferService.findAll(query);
        return ResponseFormatter.create(response);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get transfer by ID' })
    @ApiParam({ name: 'id', description: 'Transfer ID (numeric or UUID)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Transfer retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transfer not found' })
    @ApiResponse({ type: TransferResponseDto })
    async findById(
        @Param('id') id: string
    ): Promise<ResponseFormatter<TransferResponseDto>> {
        const response: TransferResponseDto = await this._transferService.findById(id);
        return ResponseFormatter.create<TransferResponseDto>(response);
    };

    @Get('company/:companyId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get transfers by company ID' })
    @ApiParam({ name: 'companyId', description: 'Company ID (numeric or UUID)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Transfers retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No transfers found' })
    @ApiResponse({ type: TransferResponseDto, isArray: true })
    async findByCompanyId(
        @Param('companyId') companyId: string
    ): Promise<ResponseFormatter<TransferResponseDto[]>> {
        const response: TransferResponseDto[] = await this._transferService.findByCompanyId(companyId);
        return ResponseFormatter.create<TransferResponseDto[]>(response);
    }

    @Get('companies/last-month')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get companies with transfers in the last month' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Companies retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No companies found' })
    @ApiResponse({ type: CompanyResponseDto, isArray: true })
    async findCompaniesAdheringLastMonth(): Promise<ResponseFormatter<CompanyResponseDto[]>> {
        const response: CompanyResponseDto[] = await this._transferService.findCompaniesWithTransfersLastMonth();
        return ResponseFormatter.create<CompanyResponseDto[]>(response);
    }
}