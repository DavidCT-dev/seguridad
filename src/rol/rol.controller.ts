import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create.rol.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { SetPermissionToRolDto } from './dto/permission.rol';
import { Permission } from 'src/auth/guards/constants/permission';
import { Permissions } from 'src/auth/guards/decorators/permissions.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('rol')
@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}
  
  @Get()
  async getRols(){
    return await this.rolService.showAllRols();
  }

  // @ApiBearerAuth()
  // @UseGuards(RolesGuard)
  @Get(':id')
  async getRol(@Param('id') id :string){
    return await this.rolService.getRolById(id)
  }
  
  @ApiBearerAuth()
  @Permissions(Permission.CREAR_ROL_CEN) 
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  @Post()
  async createRol(@Body() rolObject :CreateRolDto){
    return await this.rolService.createNewRol(rolObject)
  }

  @ApiBearerAuth()
  @Permissions(Permission.EDITAR_ROL_CEN) 
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  @Put(':id')
  async updateRol(@Param('id') id :string, @Body() rolObject:CreateRolDto){

    return await this.rolService.updatedRol(id, rolObject)
  }

  @ApiBearerAuth()
  @Permissions(Permission.ASIGNAR_PERMISO_ROL_CEN) 
  @UseGuards(RolesGuard)
  @Put('set-permission-to-rol/:id')
  async setPermissionToRol(@Param('id') id :string, @Body() setPermissionObject:SetPermissionToRolDto){
    return await this.rolService.setPermission(id, setPermissionObject)
  }

  @ApiBearerAuth()
  @Permissions(Permission.ELIMINAR_ROL_CEN) 
  @UseGuards(RolesGuard)
  @Delete(':id')
  async removeRol(@Param('id') id :string){
    return await this.rolService.deleteRol(id)
  }
}
