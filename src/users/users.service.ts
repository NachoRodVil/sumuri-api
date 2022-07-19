import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'amazon-cognito-identity-js';
import { Repository } from 'typeorm';
import { UsersEntity } from './models/users.entity';
import { UserConfig } from './users.config';

@Injectable()
export class UsersService {
  private userPool: CognitoUserPool;
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @Inject(UserConfig)
    private readonly authConfig: UserConfig,
  ) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.authConfig.userPoolId,
      ClientId: this.authConfig.clientId,
    });
  }

  authenticateUser(user: { email: string, password: string }) {
    const { email, password } = user;

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const newUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      return newUser.authenticateUser(authenticationDetails, {
        onSuccess: result => {
          resolve(result);
        },
        onFailure: err => {
          reject(err);
        },
      });
    });
  }

  registerUser(
    email: string,
    password: string
  ) {
    return new Promise((resolve, reject) => {
      return this.userPool.signUp(
        email,
        password,
        [new CognitoUserAttribute({ Name: 'email', Value: email })],
        null,
        (err, result) => {
          if (!result) {
            reject(err);
          } else {
            resolve(result.user);
          }
        },
      );
    });
  }

  createUser(name: string, email: string) {
    try {
      return this.usersRepository.save({ name, email })
    } catch (error) {
      throw new Error(error)
    }
  }

  async getUser(email: string) {
    try {
      return await this.usersRepository.findOne({ where: { email: email } })
    } catch (error) {
      throw new Error(error)
    }
  }

  getCognitoUser(email: string) {
    const cognitoUser = new CognitoUser({ Username: email, Pool: this.userPool })
    return cognitoUser
  }

  async sendVerificationCode(user: CognitoUser) {
    return new Promise((resolve, reject) => {
      user.forgotPassword({
        onSuccess(result) {
          resolve(result)
        },
        onFailure(err) {
          reject(err)
        }
      })
    })
  }

  async passwordReset(user: CognitoUser, password: string, code: string) {
    return new Promise((resolve, reject) => {
      user.confirmPassword(code, password, {
        onSuccess(result) {
          resolve(result)
        },
        onFailure(err) {
          reject(err)
        }
      })
    })
  }

  logout(){
    const user = this.userPool.getCurrentUser();
    if(user){
      user.signOut()
    } else{
      throw new Error("No user logged in")
    }
  }
}
