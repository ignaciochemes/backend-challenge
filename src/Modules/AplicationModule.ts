import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from '@nestjs/jwt';
import { importAllFromRequireContext } from "src/Helpers/Utils/RequireContext";

@Module({
    imports: [
        TypeOrmModule.forFeature(importAllFromRequireContext(require.context('../Models/Entities/', true, /Entity\.ts$/))),
        JwtModule.register({})
    ],
    providers: [
        ...importAllFromRequireContext(require.context('../Services/', true)),
        ...importAllFromRequireContext(require.context('../Daos/', true)),
    ],
    controllers: importAllFromRequireContext(require.context('../Controllers/', true)),
    exports: [TypeOrmModule],
})
export class ApplicationModule { }