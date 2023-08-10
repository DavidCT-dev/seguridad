import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../user/schema/user.schema';

import getConfig from '../config/configuration'
import { HttpService } from '@nestjs/axios';
import * as jwt from 'jsonwebtoken';
import { App, AppDocument } from 'src/apps/schema/apps.schema';


@Injectable()
export class TokenHandlerService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtAuthService: JwtService,
    private readonly httpService: HttpService,
    @InjectModel(App.name) private readonly appModel: Model<AppDocument>
  ) {}


  async generateTokenLogin(findUser, user){
    
    findUser = await this.userModel.findOne({_id:findUser._id}).populate('roles')
    const payloadLogin = { 
      id: findUser._id, 
      roles: findUser.roles, 
      fullName:`${user.name} ${user.lastName}`, 
      ci:user.ci, 
      userName:user.email
    }
    
    const token = await this.jwtAuthService.signAsync(payloadLogin);
    
    await findUser.save();

    const data = {
      apps:findUser.app,
      token,
    };
    return data;
  }


  async generateTokenMain(findUser, app){
    
    const appDataToToken = await this.AppObject(app);
    
    const payloadMain = { 
      idUser: findUser._id, 
      App: {...appDataToToken},
      roles:findUser.roles 
    };

    const token = await jwt.sign(
      payloadMain,getConfig().token_secret_use_main,
      {
        expiresIn: `${app.expiresIn}`
      }
    )
    return token
  } 


  async AppObject(findApp){
    if (!Array.isArray(findApp)) {
      findApp = [findApp];
    }
    return findApp.map(app => {
      let url = '';
        if (app.name == 'central') {
          url = getConfig().link_ip_central;
        }else if (app.name == 'personal') {
          url = getConfig().link_ip_personal;
        } else if (app.name == 'activo') {
          url = getConfig().link_ip_activo;
        } else if (app.name == 'gestion-documental') {
          url = getConfig().link_ip_gestion_documental;
        } else if (app.name == 'biblioteca') {
          url = getConfig().link_ip_biblioteca;
        }
      return {
        uuid: app.uuid.toString(),
        name: app.name,
        url:url
      };
    });
  }



  async getUsersFromPersonal(){
    try {
        const res = await this.httpService.get(`${getConfig().api_personal}api/personal`).toPromise();
        
        const userIds = res.data.map(user => user._id)
        for (const userId of userIds) {
          const existingUser = await this.userModel.findOne({ _id: userId });
          if (!existingUser) {
            await this.userModel.create({ _id: userId });
          }
        }

        return userIds; 
    } catch (error) {
      return [];
    }
  }

  
  async getPeopleAccounts(){
    try {
        const res = await this.httpService.get(`${getConfig().api_personal}api/personal`).toPromise()
      return res.data 
    } catch (error) {
      throw error.response?.data
    }
  }
}
