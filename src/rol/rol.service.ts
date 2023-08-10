import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rol, RolDocument } from './schema/rol.schema';
import { Model } from 'mongoose';
import { CreateRolDto } from './dto/create.rol.dto';
import { SetPermissionToRolDto } from './dto/permission.rol';
import { Permission, PermissionDocument } from 'src/permission/schema/permission.schema';

@Injectable()
export class RolService {
  constructor(
    @InjectModel(Rol.name) private readonly rolModel: Model<RolDocument>,
    @InjectModel(Permission.name) private readonly permissionModel: Model<PermissionDocument>,
  ) { }

  async setRolesDefault() {
    const count = await this.rolModel.estimatedDocumentCount();
    if (count > 0) return;
    const values = await Promise.all([
      this.rolModel.create({ rolName: 'user' }),
      this.rolModel.create({ rolName: 'admin' }),
      this.rolModel.create({ rolName: 'superadmin' })
    ]);
    return values;
  }

  async showAllRols(){
    return await this.rolModel.find().populate('permissionName');
  }

  async getRolById(id:string){
    return await this.rolModel.findById(id).populate('permissionName')
    
  }

  async createNewRol(rolObject:CreateRolDto){
    return await this.rolModel.create(rolObject)
  }

  async updatedRol(id:string, rolObject: CreateRolDto){
    return await this.rolModel.findByIdAndUpdate(id,rolObject,{new:true})
  } 
  
  async setPermission(id:string, setPermissionObject: SetPermissionToRolDto){
    const findRol = await this.rolModel.findById(id)
    if(!findRol){
      throw new HttpException('rol no encotrado',404)
    }
    const { permissionName } = setPermissionObject;
    
    const findPermission = await this.permissionModel.findOne({permissionName});
    
    if(!findPermission){
      throw new HttpException('permiso no encotrado',404)
    }
    
    if (!findRol.permissionName.includes(findPermission._id.toString())) {
      findRol.permissionName.push(findPermission._id.toString());
    } else {
      throw new HttpException('El permiso ya existe en el rol', 400);
    }
    
    return findRol.save()
  }

  async deleteRol(id:string){
    return await this.rolModel.findByIdAndDelete(id)
  }
}
