import { Body, Controller, Get, HttpException, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SetPasswordUserDto } from './dto/set-password-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAppDto } from 'src/apps/dto/create-system.dto';
import { CreateRolDto } from 'src/rol/dto/create.rol.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission } from 'src/auth/guards/constants/permission';
import { Permissions } from 'src/auth/guards/decorators/permissions.decorator';
import { UpdateAppDto } from './dto/update-user.dto';


@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers() {
    try {
      const data = await this.userService.getAllUsers();

      for(const uuid of data){
        uuid.app
      }    
      return data
    } catch (error) {
      if(error instanceof HttpException){
        throw error
      };
    }
  }


  // @ApiBearerAuth()
  // @Permissions(Permission.ASIGNAR_CONTRASEÑA_CEN) 
  // @UseGuards(RolesGuard)
  @Put('/set-password-to-user/:id')
  async setPasswordUser(
    @Param('id') id: string,
    @Body() password: SetPasswordUserDto,
  ) {
    try {
      return await this.userService.setPassword(id, password);      
    } catch (error) {
      console.log(error)
      if(error instanceof HttpException){
        throw error
      };
    }
  }

  @ApiBearerAuth()
  @Permissions(Permission.ASIGNAR_APLICACION_CEN) 
  @UseGuards(RolesGuard)
  @Put('set-app-to-user/:idUser')
  async setSystemUser(
    @Param('idUser') id: string,
    @Body() appObject: UpdateAppDto,
  ) {
    try {
      return await this.userService.setUserApp(id, appObject);
    } catch (error) {
      if(error instanceof HttpException){
        throw error
      };
    }
    
  }


  @ApiBearerAuth()
  @Permissions(Permission.ASIGNAR_ROL_CEN) 
  @UseGuards(RolesGuard)
  @Put('set-rol-to-user/:idUser')
  async setRolUser(@Param('idUser') id: string, @Body() rolObject: CreateRolDto,
  ) {
    try {
      return await this.userService.setUserRol(id, rolObject);
    } catch (error) {
      if(error instanceof HttpException){
        throw error
      };
    }
  }


  @ApiBearerAuth()
  @Permissions(Permission.REMOVER_ROL_USUARIO_CEN) 
  @UseGuards(RolesGuard)
  @Put('remove-rol-to-user/:idUser')
  async removeRolUser(@Param('idUser') id: string, @Body() rolObject: CreateRolDto,
  ) {
    try {
          return await this.userService.removeUserRol(id, rolObject);
    } catch (error) {
      if(error instanceof HttpException){
        throw error
      };
    }
  }
}
