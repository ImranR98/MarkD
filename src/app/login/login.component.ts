import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ErrorService } from '../services/error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private errorService: ErrorService) { }

  passwordForm = new FormGroup({
    password: new FormControl('', Validators.required)
  })

  isFirstTime: boolean = true
  loading: boolean = false

  firstTimeCheck() {
    if (this.authService.ifLoggedIn(false)) this.router.navigate(['/categories'])
    this.loading = true
    this.authService.ifPassword().then(res => {
      this.isFirstTime = res
      this.loading = false
    }).catch(err => {
      this.loading = false
      this.errorService.showError(err, () => this.firstTimeCheck(), null)
    })
  }

  ngOnInit(): void {
    this.firstTimeCheck()
  }

  submit() {
    let password = this.passwordForm.controls['password'].value
    if (this.isFirstTime) {
      if (password.length > 15) {
        this.authService.createPassword(password).then(() => {
          this.isFirstTime = false
          this.passwordForm.reset()
        }).catch(err => this.errorService.showError(err))
      } else {
        this.errorService.showError('Password must be longer than 15 characters.')
      }
    } else {
      this.authService.auth(password).then(() => {
        this.isFirstTime = false
        this.router.navigate(['/choice'])
      }).catch(err => {
        this.errorService.showError(err)
      })
    }
  }

}
