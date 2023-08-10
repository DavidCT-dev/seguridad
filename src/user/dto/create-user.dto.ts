export class CreateUserDto {
 
  password:string;

  roles: string[];

  app: string[]

  token: string;

  failedLoginAttempts: number;

  isLocked: boolean;
  
  lockedUntil: Date;
  
  fullName:string
  
}
