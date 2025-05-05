import { Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import ResponseFormatter from "src/Helpers/Formatter/ResponseFormatter";
import { CompanyResponseDto } from "src/Models/Response/CompanyController/CompanyResponseDto";
import GenericResponse from "src/Models/Response/GenericResponse";
import { CompanyService } from "src/Services/CompanyService";

@Controller("companies")
export class CompanyController {
    constructor(private readonly _companyService: CompanyService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createCompany(data: any): Promise<ResponseFormatter<GenericResponse>> {
        const response: GenericResponse = await this._companyService.createCompany(data);
        return ResponseFormatter.create<GenericResponse>(response);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ResponseFormatter<CompanyResponseDto[]>> {
        const response: CompanyResponseDto[] = await this._companyService.findAll();
        return ResponseFormatter.create<CompanyResponseDto[]>(response);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(id: string): Promise<ResponseFormatter<CompanyResponseDto>> {
        const response: CompanyResponseDto = await this._companyService.findById(id);
        return ResponseFormatter.create<CompanyResponseDto>(response);
    }

    @Get('adhering/last-month')
    @HttpCode(HttpStatus.OK)
    async findCompaniesAdheringLastMonth(): Promise<ResponseFormatter<CompanyResponseDto[]>> {
        const response: CompanyResponseDto[] = await this._companyService.findCompaniesAdheringLastMonth();
        return ResponseFormatter.create<CompanyResponseDto[]>(response);
    }
}