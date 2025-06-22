// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'us-east-1_9tsb64ERp', // <-- tu User Pool ID
  ClientId: '3tspci7ln4fgtdhincrulufljh'  // <-- tu App Client ID
};

const userPool = new CognitoUserPool(poolData);

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  register(email: string, password: string): Promise<any> {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email })
    ];

    return new Promise((resolve, reject) => {
      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  login(email: string, password: string): Promise<any> {
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    const user = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    return new Promise((resolve, reject) => {
      user.authenticateUser(authDetails, {
        onSuccess: (result) => {
          resolve(result.getIdToken().getJwtToken());
        },
        onFailure: (err) => reject(err)
      });
    });
  }

  logout(): void {
    const user = userPool.getCurrentUser();
    if (user) user.signOut();
  }

  getCurrentUser(): CognitoUser | null {
    return userPool.getCurrentUser();
  }
}
