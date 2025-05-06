import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({ name: 'GenericResponse' })
export default class GenericResponse {
    @ApiProperty({ description: 'Generic response message', example: 'Operation completed successfully' })
    message: string;

    constructor(message: string) {
        this.message = message;
    }
}
