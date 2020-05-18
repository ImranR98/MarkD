import { Component, OnInit, OnDestroy } from '@angular/core';
import { NoteInfo, FolderInfo } from '../types';
import { NotesService } from '../services/notes.service';
import { ErrorService } from '../services/error.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  constructor(private notesService: NotesService, private errorService: ErrorService) { }

  processing: boolean = false
  list$: BehaviorSubject<FolderInfo[]> = new BehaviorSubject(null)

  currentlyOpen = null

  getNotes() {
    this.notesService.list().then((list: FolderInfo[]) => {
      this.list$.next(list)
    }).catch(err => {
      this.list$.next(null)
      this.errorService.showError(err, () => this.getNotes())
    })
  }

  openedFolder(folder: string) {
    this.currentlyOpen = folder
    localStorage.setItem('openFolder', folder)
  }

  closedFolder(folder: string) {
    if (localStorage.getItem('openFolder') === folder) localStorage.removeItem('openFolder')
  }

  ngOnInit(): void {
    this.currentlyOpen = localStorage.getItem('openFolder')
    this.getNotes()
  }

}
