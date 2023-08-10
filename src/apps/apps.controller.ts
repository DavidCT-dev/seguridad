import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Res, ValidationPipe, UsePipes } from '@nestjs/common';
import { AppsService } from './apps.service';
import { CreateAppDto } from './dto/create-system.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Response } from 'express';
import { Permission } from 'src/auth/guards/constants/permission';
import { Permissions } from 'src/auth/guards/decorators/permissions.decorator';

@ApiTags('app')
@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  
  @Get()
  async findAll() {
    return await this.appsService.findAll();
  }

  @Get(':id')
  async getAppById(@Param('id') id:string) {
    return await this.appsService.findOne(id);
  }

  @ApiBearerAuth()
  @Permissions(Permission.CREAR_APP_CEN) 
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  @Post()
  async createApp (@Body() appObject:CreateAppDto){
    return await this.appsService.createNewApp(appObject)
  }


  @ApiBearerAuth()
  @Permissions(Permission.EDITAR_APP_CEN) 
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  @Put('/update-app:id')
  async updateApp(@Param('id') id:string, @Body() appNewObject: CreateAppDto){
    return await this.appsService.updatedApp(id,appNewObject)
  }

  @ApiBearerAuth()
  @Permissions(Permission.ELIMINAR_APP_CEN) 
  @UseGuards(RolesGuard)
  @Delete('/delete-app:id')
  async deleteApp(@Param('id') id:string, @Res() res: Response){
    await this.appsService.removeApp(id)
    res.status(200).send('aplicacion eliminada')
  }
  
  
  @ApiBearerAuth()
  @Permissions(Permission.RESTABLECER_APP_CEN) 
  @UseGuards(RolesGuard)
  @Put('/restart-app:id')
  async restartApp(@Param('id') id:string, @Res() res: Response){
    await this.appsService.restartApplication(id)
    res.status(200).send('aplicacion restablecida')
  }
}
