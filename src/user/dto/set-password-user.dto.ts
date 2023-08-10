import { ApiProperty } from "@nestjs/swagger";

export class SetPasswordUserDto {

  @ApiProperty()
  password:string;

}
