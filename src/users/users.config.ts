
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserConfig {
    public userPoolId: string = process.env.COGNITO_USER_POOL_ID;
    public clientId: string = process.env.COGNITO_CLIENT_ID;
}