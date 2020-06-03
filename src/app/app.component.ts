import { Component, OnInit } from '@angular/core'
import { AuthService } from './services/auth.service'
import { DataService } from './services/data.service'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'MarkD'

  constructor(public authService: AuthService, private dataService: DataService, private router: Router, private titleService: Title) { }

  ngOnInit() {
    const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)
    this.authService.ifLoggedIn(false)
    this.router.events.subscribe(event => {
      let routerUrlChildren = this.router.parseUrl(this.router.url).root.children
      let titlePrefix = ''
      if (routerUrlChildren.primary) titlePrefix = routerUrlChildren.primary.segments.map(segment => segment.path).pop()
      if (titlePrefix) titlePrefix = capitalizeFirstLetter(titlePrefix) + ' - '
      this.titleService.setTitle(titlePrefix + this.title)
    })
  }

  logout() {
    this.authService.logout(true)
  }

  toggleDeckNav() {
    this.dataService.toggleDeckNavEvent()
  }
}
