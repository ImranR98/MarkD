import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FolderInfo, NoteInfo, Note } from '../types';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatGridList } from '@angular/material/grid-list';
import { NotesService } from '../services/notes.service';
import { ErrorService } from '../services/error.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  subs: Subscription[] = []
  folder$: BehaviorSubject<FolderInfo> = new BehaviorSubject(null)
  folders$: BehaviorSubject<string[]> = new BehaviorSubject([])

  displayedNotes: NoteInfo[] = []

  sortOptions = ['Name', 'Date Created', 'Date Last Modified']
  searchQuery: string = ''
  selectedSort = 0

  constructor(private route: ActivatedRoute, private mediaObserver: MediaObserver, private notesService: NotesService, private errorService: ErrorService, private router: Router) { }

  @ViewChild('grid') grid: MatGridList;
  gridByBreakpoint = {
    xl: 8,
    lg: 6,
    md: 4,
    sm: 2,
    xs: 1
  }

  getFolder(folder: string) {
    this.notesService.getFolder(folder).then(folder => {
      this.folder$.next(folder.folder)
      this.folders$.next(folder.folders)
    }).catch(err => {
      this.folder$.next(null)
      this.folders$.next([])
      this.errorService.showError(err, () => this.getFolder(folder), null)
    })
  }

  changeGridSize(cols: number) {
    if (this.grid) this.grid.cols = cols
    else setTimeout(() => {
      this.changeGridSize(cols)
    })
  }

  ngOnInit(): void {
    this.subs.push(this.folder$.subscribe(folder => {
      this.refreshDisplayedNotes()
    }))
    this.subs.push(this.route.paramMap.subscribe(params => {
      this.getFolder(params.get('folder'))
    }))
    this.subs.push(this.mediaObserver.asObservable().subscribe((change: MediaChange[]) => {
      this.changeGridSize(this.gridByBreakpoint[change[0].mqAlias])
      if (this.grid) this.grid.cols = this.gridByBreakpoint[change[0].mqAlias]
    }))
  }

  refreshDisplayedNotes() {
    if (this.folder$.value) {
      localStorage.setItem(`sort-${this.folder$.value.folder}`, this.selectedSort.toString())
      if (this.searchQuery.length > 0) {
        let queryWords = this.searchQuery.toLowerCase().split(' ')
        this.displayedNotes = this.folder$.value.notes.map(note => {
          let searchHits = 0
          queryWords.forEach(word => note.fileName.toLowerCase().indexOf(word) >= 0 ? searchHits++ : null)
          return { note, searchHits }
        }).filter(result => result.searchHits > 0).sort((a, b) => a.searchHits - b.searchHits).map(result => result.note)
      } else {
        this.displayedNotes = this.folder$.value.notes
      }
      switch (this.selectedSort) {
        case 0:
          this.displayedNotes = this.displayedNotes.sort((a, b) => a.fileName.localeCompare(b.fileName))
          break;
        case 1:
          this.displayedNotes = this.displayedNotes.sort((a, b) => b.created.toString().localeCompare(a.created.toString()))
          break;
        case 2:
          this.displayedNotes = this.displayedNotes.sort((a, b) => b.modified.toString().localeCompare(a.modified.toString()))
          break;
        default:
          this.displayedNotes = this.displayedNotes.sort((a, b) => b.modified.toString().localeCompare(a.modified.toString()))
          break;
      }
    }
  }

  deleteNote(folder: string, fileName: string) {
    if (confirm('Delete this file? This is permanent.')) {
      this.notesService.deleteNote(folder, fileName).then(() => {
        this.folder$.value.notes = this.folder$.value.notes.filter(note => note.fileName != fileName)
        this.refreshDisplayedNotes()
      }).catch(err => this.errorService.showError(err, () => this.deleteNote(folder, fileName)))
    }
  }

  renameNote(folder: string, fileName: string) {
    let newName = prompt('Enter new name')
    if (newName) {
      this.notesService.renameNote(folder, fileName, newName).then(() => {
        this.folder$.value.notes = this.folder$.value.notes.map(note => {
          if (note.fileName == fileName) note.fileName = newName.endsWith('.md') ? newName : newName + '.md'
          return note
        })
      }).catch(err => this.errorService.showError(err, () => this.renameNote(folder, fileName)))
    }
  }

  moveNote(folder: string, toFolder: string, fileName: string) {
    this.notesService.moveNote(folder, toFolder, fileName).then(() => {
      this.folder$.value.notes = this.folder$.value.notes.filter(note => note.fileName != fileName)
      this.refreshDisplayedNotes()
    }).catch(err => this.errorService.showError(err, () => this.moveNote(folder, toFolder, fileName)))
  }
}
