import { Component, OnInit } from '@angular/core'
import { AuthService } from './services/auth.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'MarkD'

  constructor(public authService: AuthService) { }

  ngOnInit() {
    this.authService.ifLoggedIn(false)
  }

  logout() {
    this.authService.logout(true)
  }
}
