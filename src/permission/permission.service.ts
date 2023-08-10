import { HttpException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schema/permission.schema';
import { Model } from 'mongoose';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name) private readonly permissionModel: Model<PermissionDocument>,
  ){}
  
  async setPermissionDefault() {
    const count = await this.permissionModel.estimatedDocumentCount();
    if (count > 0) return;
    const values = await Promise.all([
      this.permissionModel.create({ permissionName: 'ESTABLECER_CONTRASEÑA_USUARIO_CEN' }),
      this.permissionModel.create({ permissionName: 'ESTABLECER_APP_USUARIO_CEN' }),
      this.permissionModel.create({ permissionName: 'ESTABLECER_ROL_USUARIO_CEN' }),
      this.permissionModel.create({ permissionName: 'REMOVER_ROL_USUARIO_CEN' }),

      this.permissionModel.create({ permissionName: 'CREAR_ROL_CEN' }),
      this.permissionModel.create({ permissionName: 'EDITAR_ROL_CEN' }),
      this.permissionModel.create({ permissionName: 'ESTABLECER_PERMISO_ROL_CEN' }),
      this.permissionModel.create({ permissionName: 'ELIMINAR_ROL_CEN' }),
      
      this.permissionModel.create({ permissionName: 'CREAR_PERMISO_CEN' }),
      this.permissionModel.create({ permissionName: 'EDITAR_PERMISO_CEN' }),
      this.permissionModel.create({ permissionName: 'ELIMINAR_PERMISO_CEN' }),

      this.permissionModel.create({ permissionName: 'CREAR_APP_CEN' }),
      this.permissionModel.create({ permissionName: 'EDITAR_APP_CEN' }),
      this.permissionModel.create({ permissionName: 'ELIMINAR_APP_CEN' }),
      this.permissionModel.create({ permissionName: 'RESTABLECER_APP_CEN' }),
    ]);
    return values;
  }

  async create(createPermissionDto: CreatePermissionDto) {
    return await this.permissionModel.create(createPermissionDto);
  }

  async findAll() {
    return await this.permissionModel.find();
  }

  async findOne(id: string) {
    return await this.permissionModel.findById(id);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const findPermission = await this.permissionModel.findById(id)
    if(!findPermission){
      throw new HttpException('permiso no encotrado',404)
    }
    return await this.permissionModel.findByIdAndUpdate(id,updatePermissionDto,{new:true});
  }

  async remove(id: string) {
    return await this.permissionModel.findByIdAndDelete(id);
  }
}
