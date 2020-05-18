import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as moment from 'moment/moment'
import * as jwt_decode from 'jwt-decode'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true // Make sure JWT header is sent
  }

  isLoggedIn = new BehaviorSubject(false)

  // Send a new password to /createPassword for first time setup (server rejects this if a password already exists)
  async createPassword(password: string): Promise<any> {
    if (confirm('Continue? The password cannot be recovered later.')) {
      let res = await this.http.post(environment.apiUrl + '/createPassword', { password }, this.httpOptions).toPromise()
      return res
    }
  }

  // Attempt to change password (server rejects this if user is not logged in (JWT doesn't exist))
  async changePassword(password: string): Promise<any> {
    if (confirm('Continue? The password cannot be recovered later. You will be logged out.')) {
      let res = await this.http.post(environment.apiUrl + '/changePassword', { password }, this.httpOptions).toPromise()
      this.logout(true)
      alert('Password was changed.')
      return res
    }
  }

  // Check if the password has already been saved
  async ifPassword(): Promise<boolean> {
    let result = await this.http.get(environment.apiUrl + '/ifPassword', this.httpOptions).toPromise()
    return !!result
  }

  // Validate the password and get a JSON Web Token to authenticate future requests
  async auth(password: string): Promise<boolean> {
    let response: any = await this.http.post(environment.apiUrl + '/auth', { password }, this.httpOptions).toPromise()
    if (response.jwtToken) {
      localStorage.setItem('JWT', response.jwtToken)
      this.isLoggedIn.next(true)
      return true
    } else {
      this.isLoggedIn.next(false)
      return false
    }
  }

  // Used for HTTPInterceptor
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.ifLoggedIn(true)
  }

  // Return true if a valid JWT exists and is not expired
  ifLoggedIn(redirect: boolean) {
    let valid: boolean = (moment().isBefore(this.getJWTExpiration()))
    if (!valid) {
      this.logout(redirect)
    }
    this.isLoggedIn.next(valid)
    return valid
  }

  // Clear the JWT and redirect to home page
  logout(redirect: boolean = true) {
    this.isLoggedIn.next(false)
    localStorage.removeItem('JWT')
    if (redirect) {
      this.router.navigate(['/login'])
    }
  }

  // Get the time JWT expires
  getJWTExpiration() {
    let JWT = localStorage.getItem('JWT')
    if (JWT) {
      return moment.unix(Number.parseInt(jwt_decode(JWT).exp))
    } else {
      return null
    }
  }
}
