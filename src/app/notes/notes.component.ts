import { Component, OnInit } from '@angular/core';
import { FolderInfo } from '../types';
import { NotesService } from '../services/notes.service';
import { ErrorService } from '../services/error.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  constructor(private notesService: NotesService, private errorService: ErrorService) { }

  processing: boolean = false
  list$: BehaviorSubject<FolderInfo[]> = new BehaviorSubject(null)

  list: FolderInfo[] = null

  currentlyOpen = null

  getNotes() {
    this.notesService.list().then((list: FolderInfo[]) => {
      this.list$.next(list)
    }).catch(err => {
      this.list$.next(null)
      this.errorService.showError(err, () => this.getNotes(), null)
    })
  }

  openedFolder(folder: string) {
    this.currentlyOpen = folder
    localStorage.setItem('openFolder', folder)
  }

  closedFolder(folder: string) {
    if (localStorage.getItem('openFolder') === folder) localStorage.removeItem('openFolder')
  }

  addFolder(newFolder: string = '') {
    if (!newFolder) {
      newFolder = prompt('Enter Folder Name')
    }
    let exists = false
    this.list.forEach(folder => folder.folder.trim() == newFolder.trim() ? exists = true : null)
    if (exists) {
      this.errorService.showError(`${newFolder.trim()} already exists`)
    } else {
      this.notesService.createFolder(newFolder).then(() => {
        this.list.push({
          folder: newFolder,
          notes: []
        })
      }).catch(err => {
        this.errorService.showError(err, () => this.addFolder(newFolder))
      })
    }
  }

  moveNote(e: { folder: string, fileName: string, toFolder: string }) {
    this.notesService.moveNote(e.folder, e.toFolder, e.fileName).then(() => {
      this.ngOnInit()
    }).catch(err => {
      this.errorService.showError(err, () => this.moveNote({ folder: e.folder, fileName: e.fileName, toFolder: e.toFolder }))
    })
  }

  ngOnInit(): void {
    this.currentlyOpen = localStorage.getItem('openFolder')
    this.list$.subscribe(list => {
      this.list = list
    })
    this.getNotes()
  }

}
