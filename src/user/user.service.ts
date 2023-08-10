import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { SetPasswordUserDto } from './dto/set-password-user.dto';
import { hash } from 'bcrypt'
import { TokenHandlerService } from 'src/auth/token.handler.service';
import { App, AppDocument } from 'src/apps/schema/apps.schema';
import { v4 as uuidv4 } from 'uuid';
import { CreateAppDto } from 'src/apps/dto/create-system.dto';
import { CreateRolDto } from 'src/rol/dto/create.rol.dto';
import { Rol, RolDocument } from 'src/rol/schema/rol.schema';
import { HttpService } from '@nestjs/axios';
import getConfig from '../config/configuration' 
import { UpdateAppDto } from './dto/update-user.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(App.name) private readonly appModel: Model<AppDocument>,
    @InjectModel(Rol.name) private readonly rolModel: Model<RolDocument>,
    private readonly tokenHandlerService: TokenHandlerService,
    private httpService:HttpService
  ){}

  async setAppDefault(): Promise<void> {
    const centralApp = await this.appModel.findOne({ name: 'central' }).exec();
  
    const users = await this.userModel.find({}).exec();
    for (const user of users) {
      if (!user.app || user.app.length === 0) {
        user.app = [centralApp?.uuid.toString()];
        await user.save();
      }
    }
  }


  async setRolDefault(): Promise<void> {
    const rol = await this.rolModel.findOne({ rolName: 'user' }).exec();
  
    const users = await this.userModel.find({}).exec();
    for (const user of users) {
      if (!user.roles || user.roles.length === 0) {
        user.roles = [rol?._id.toString()];
        await user.save();
      }
    }
  }



  async getAllUsers() {
    try {
     const data =  await this.tokenHandlerService.getUsersFromPersonal();

     const getApiPersonal = []

     for(const id of data){
      const res = await this.httpService.get(`${getConfig().api_personal}api/personal/${id}`).toPromise()
      getApiPersonal.push(res.data)
     }

     const allDataPersonal = await this.userModel.find()
     const combinedData = getApiPersonal.map((obj, index) => ({
      id: allDataPersonal[index]._id,
      password: allDataPersonal[index].password,
      roles:allDataPersonal[index].roles,
      app:allDataPersonal[index].app,
      name: obj.name,
      lastname: obj.lastName,
      ci: obj.ci,
      email: obj.email,
      phone: obj.phone,
      isActive:obj.isActive
    }));

     await this.setAppDefault();
     await this.setRolDefault();

       return combinedData
    } catch (error) {
      console.log(error);
    }
  }

  async setPassword(_id:string, password:SetPasswordUserDto){
    
    let findUser = await this.userModel.findOne({_id})
    if (!findUser){
      throw new HttpException('Usuario no encontrado', 404);
    }
  
    const plainToHash = await hash(password.password, 10);

    findUser.password = plainToHash
    
    return findUser.save()
  }


  async setUserApp(_id :string, appObject:UpdateAppDto){
    const user = await this.userModel.findOne({_id}) 

    if(!user){
      throw new NotFoundException('usuario no encontrado');
    }

    const { name } = appObject;
    const app = await this.appModel.findOne({name:name.toLocaleLowerCase()})
    
    if(!app){
      throw new NotFoundException('la aplicacion no existe');
    }

    if( app.isDeleted === true ){
      throw new NotFoundException('la aplicacion esta eliminada');
    }
    user.app.push(app.uuid.toString())
    return user.save();
  }


  async setUserRol(_id :string, rolObject:CreateRolDto){
    const user = await this.userModel.findOne({_id}) 
    if(!user){
      throw new NotFoundException('usuario no encontrado');
    }

    const { rolName } = rolObject;
    const rol = await this.rolModel.findOne({rolName})

    if(!rol){
      throw new NotFoundException('rol no encontrado');
    }

    user.roles.push(rol._id.toString())
    return user.save();
  }

  async removeUserRol(_id:string, rolObject:CreateRolDto){
    
    const user = await this.userModel.findOne({_id}) 

    if(!user){
      throw new NotFoundException('usuario no encontrado');
    }
    const { rolName } = rolObject
    const findRol = await this.rolModel.findOne({name}) 

    if(!findRol){
      throw new NotFoundException('rol no encontrado');
    }

    if (user.roles.includes(findRol._id.toString())) {
      console.log('ingresa')
      user.roles = user.roles.filter(role => role.toString() !== findRol._id.toString()
      );
    }else{
      throw new HttpException('el usuario no tiene el rol ingresado',404)
    }
    return user.save()
    
  }

}








