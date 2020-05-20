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
  folders$: BehaviorSubject<string[]> = new BehaviorSubject(null)

  folders: string[] = null

  currentlyOpen = null

  getFolders() {
    this.notesService.getFolders().then((folders: string[]) => {
      this.folders$.next(folders)
    }).catch(err => {
      this.folders$.next(null)
      this.errorService.showError(err, () => this.getFolders(), null)
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
    this.folders.forEach(folder => folder.trim() == newFolder.trim() ? exists = true : null)
    if (exists) {
      this.errorService.showError(`${newFolder.trim()} already exists`)
    } else {
      this.notesService.createFolder(newFolder).then(() => {
        this.folders.push(newFolder)
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

  deleteFolder(folder: string) {
    this.notesService.deleteFolder(folder).then(() => {
      this.folders = this.folders.filter(lFolder => lFolder != folder)
    }).catch(err => this.errorService.showError(err, () => this.deleteFolder(folder)))
  }

  renameFolder(folder: string) {
    let newName = prompt('Enter new name')
    if (newName) {
      this.notesService.renameFolder(folder, newName).then(() => {
        this.folders = this.folders.map(lFolder => {
          if (lFolder == folder) lFolder = newName
          return lFolder
        })
      }).catch(err => this.errorService.showError(err, () => this.renameFolder(folder)))
    }
  }

  ngOnInit(): void {
    this.currentlyOpen = localStorage.getItem('openFolder')
    this.folders$.subscribe(list => {
      this.folders = list
    })
    this.getFolders()
  }

}
