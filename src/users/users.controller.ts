import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async signIn(@Body('name') name: string, @Body('email') email: string, @Body('password') password: string){
    try {
      await this.usersService.registerUser(email, password);
      await this.usersService.createUser(name, email)
      return `User ${name} and email ${email} has been succesfully created.`
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    const authenticateRequest = {email, password}
    try {
      const awsAuth = await this.usersService.authenticateUser(authenticateRequest);
      const user = await this.usersService.getUser(email)
      return {name:user.name, email: email, auth: true, awsAuth}
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('verifyEmail')
  async verifyEmail(@Body('email') email: string) {
    try {
      const cognitoUser = await this.usersService.getCognitoUser(email)
      await this.usersService.sendVerificationCode(cognitoUser)
      return 'Verification Code has been sent'
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('resetPassword')
  async resetPassword(@Body('email') email: string, @Body('password') password: string, @Body('code') code: string) {
    try {
      const cognitoUser = await this.usersService.getCognitoUser(email)
      await this.usersService.passwordReset(cognitoUser, password, code)
      return 'Your password has been changed'
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('logout')
  async logout() {
    try{
    await this.usersService.logout()
    return "You have logged out"
    } catch(e){
      throw new BadRequestException(e.message);

    }
  }
  
}
