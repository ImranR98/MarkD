import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core'
import { MediaMatcher } from '@angular/cdk/layout'
import { Board } from '../types'
import { MatSidenav } from '@angular/material/sidenav'
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { DataService } from '../services/data.service'
import { ErrorService } from '../services/error.service'

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss']
})
export class BoardsComponent implements OnInit {
  boards: Board[] = []

  activeBoardIndex: number = null
  mobileQuery: MediaQueryList
  @ViewChild('sidenav') sidenav: MatSidenav

  lastChangeSent: any = null
  moreChanges: boolean = false
  saving: boolean = false

  loading: boolean = false

  private _mobileQueryListener: () => void

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private dataService: DataService, private errorService: ErrorService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)')
    this._mobileQueryListener = () => changeDetectorRef.detectChanges()
    this.mobileQuery.addListener(this._mobileQueryListener)
  }

  getBoards() {
    this.loading = true
    this.dataService.getBoards().then(boards => {
      this.loading = false
      this.boards = boards
      if (this.boards.length > 0) this.activeBoardIndex = 0
      if (!this.mobileQuery.matches) setTimeout(() => { this.sidenav.open() })
    }).catch(err => {
      this.loading = false
      this.errorService.showError(err, () => this.getBoards())
    })
  }

  ngOnInit(): void {
    this.dataService.setLastVisitedPage('deck')
    this.getBoards()
  }

  somethingChanged(e: Event = null) {
    this.moreChanges = true
    if (this.lastChangeSent) clearTimeout(this.lastChangeSent)
    this.lastChangeSent = setTimeout(() => {
      this.saving = true
      this.dataService.setBoards(this.boards).then(() => {
        this.saving = false
        this.moreChanges = false
      }).catch(err => {
        this.saving = false
        console.log(err)
        this.errorService.showError(err, () => this.somethingChanged(e))
      })
    }, 1000)
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex)
    }
    if (this.activeBoardIndex == event.previousIndex) {
      if (event.currentIndex < this.boards.length) this.activeBoardIndex = event.currentIndex
    } else {
      if (event.previousIndex < this.boards.length) this.activeBoardIndex = event.previousIndex
    }
    this.somethingChanged()
  }

  addBoard() {
    this.boards.push(new Board())
    this.activeBoardIndex = this.boards.length - 1
    this.somethingChanged()
  }

  deleteBoard(boardIndex: number) {
    this.boards.splice(boardIndex, 1)
    this.activeBoardIndex = null
    this.somethingChanged()
  }

}
