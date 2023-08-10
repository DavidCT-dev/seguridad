import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { App, AppDocument } from './schema/apps.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/schema/user.schema';
import { CreateAppDto } from './dto/create-system.dto';

@Injectable()
export class AppsService {
  
  constructor(
    @InjectModel(App.name) private readonly appModel: Model<AppDocument>,
  @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ){}

async setAppsDefault() {
    const count = await this.appModel.estimatedDocumentCount();
    if (count > 0) return;
    const values = await Promise.all([
      this.appModel.create({ name: 'personal', expiresIn:'4h'}),
      this.appModel.create({ name: 'activo', expiresIn:'4h' }),
      this.appModel.create({ name: 'central', expiresIn:'6h' }),
      this.appModel.create({ name: 'gestion-documental', expiresIn:'4h' }),
      this.appModel.create({ name: 'biblioteca', expiresIn:'4h' })
    ]);
    return values;
  }

  
  async findAll() {
    return await this.appModel.find({ isDeleted: false }).exec();
  }
  
  async findOne(id:string){
    const findApp = await this.appModel.findOne({uuid:id})
    if(!findApp){
      throw new HttpException('aplicacion no encontrada',404)
    }
    if(findApp.isDeleted == true){
      throw new HttpException('aplicacion eliminada',404)
    }
    return findApp
  }
  
  async createNewApp(appObject:CreateAppDto){
    const { name } = appObject

    const findApp = await this.appModel.findOne({ name: name.toLocaleLowerCase() })
    
    if(findApp){
      throw new HttpException('la aplicacion ya existe',409)
    }

    return await this.appModel.create(appObject);
  }
  
  async updatedApp (id:string, appNewObject:CreateAppDto){
    return await this.appModel.findByIdAndUpdate(id, appNewObject,{new:true});
  }

  async removeApp(id : string){
    const deleteApp = await this.appModel.findOne({ _id: id })
    if (!deleteApp) {
      throw new HttpException('la aplicacion no existe',409)
    }
    deleteApp.isDeleted = true 
    return deleteApp.save()
  }

  async restartApplication(id : string){
    const restartApp = await this.appModel.findOne({ _id: id })
    if (!restartApp) {
      throw new HttpException('la aplicacion no existe',409)
    }
    restartApp.isDeleted = false 
    return restartApp.save()
  }

}
