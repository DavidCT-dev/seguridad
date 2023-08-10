import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import getConfig from './config/configuration'
import { AppsService } from './apps/apps.service';
import { RolService } from './rol/rol.service';
import { PermissionService } from './permission/permission.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const rol = app.get(RolService)
  rol.setRolesDefault()

  const apps = app.get(AppsService)
  apps.setAppsDefault()

  const permission = app.get(PermissionService)
  permission.setPermissionDefault()

  const config = new DocumentBuilder()   
    .addBearerAuth()  
    .setTitle('API Documentation')
    .setDescription('API central')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('user')
    .addTag('rol')
    .addTag('permission')
    .addTag('app')
    .build();

  const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api', app, document,{
      explorer:true,
    });
  
  await app.listen(getConfig().port);
}
bootstrap();
