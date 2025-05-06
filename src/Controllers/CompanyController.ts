import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import ResponseFormatter from "src/Helpers/Formatter/ResponseFormatter";
import { LoggingInterceptor } from "src/Helpers/Interceptors/LogginInterceptor";
import { CompanyResponseDto } from "src/Models/Response/CompanyController/CompanyResponseDto";
import GenericResponse from "src/Models/Response/GenericResponse";
import { CompanyService } from "src/Services/CompanyService";

@ApiTags('companies')
@Controller("companies")
@UseInterceptors(LoggingInterceptor)
export class CompanyController {
    constructor(private readonly _companyService: CompanyService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiOperation({ summary: 'Create a new company' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Company created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Company with this CUIT already exists' })
    async createCompany(data: any): Promise<ResponseFormatter<GenericResponse>> {
        const response: GenericResponse = await this._companyService.createCompany(data);
        return ResponseFormatter.create<GenericResponse>(response);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all companies with pagination' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Companies retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No companies found' })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<ResponseFormatter<CompanyResponseDto[]>> {
        const response: CompanyResponseDto[] = await this._companyService.findAll();
        return ResponseFormatter.create<CompanyResponseDto[]>(response);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get company by ID' })
    @ApiParam({ name: 'id', description: 'Company ID (numeric or UUID)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Company retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
    async findById(
        @Param('id') id: string
    ): Promise<ResponseFormatter<CompanyResponseDto>> {
        const response: CompanyResponseDto = await this._companyService.findById(id);
        return ResponseFormatter.create<CompanyResponseDto>(response);
    }

    @Get('adhering/last-month')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get companies that adhered in the last month' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Companies retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No companies found' })
    async findCompaniesAdheringLastMonth(): Promise<ResponseFormatter<CompanyResponseDto[]>> {
        const response: CompanyResponseDto[] = await this._companyService.findCompaniesAdheringLastMonth();
        return ResponseFormatter.create<CompanyResponseDto[]>(response);
    }
}