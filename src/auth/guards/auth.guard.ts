import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { User, UserDocument } from 'src/user/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenExpiredError } from 'jsonwebtoken';
import getConfig from '../../config/configuration'


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // console.log(request)
    const token = this.extractTokenFromHeader(request);
    // console.log('tokennnnn', token)
    if (!token) {
      throw new UnauthorizedException('no existe token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token,
        {
          secret: getConfig().token_secret_login,
          ignoreExpiration: false
        })
      const userId = payload.id
      const user = await this.userModel.findById(userId)
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      
      request['user'] = payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expirado');
      }
      throw new UnauthorizedException('Usuario no logueado')
    }

    return true;
  }

  private extractTokenFromHeader(request: Request & { headers: { authorization?: string } }): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

