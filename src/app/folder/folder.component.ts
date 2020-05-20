import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FolderInfo, NoteInfo, Note } from '../types';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatGridList } from '@angular/material/grid-list';
import { NotesService } from '../services/notes.service';
import { ErrorService } from '../services/error.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  @Input() list: FolderInfo[]
  @Input() fIndex: number
  @Output() noteMover: EventEmitter<{ folder: string, fileName: string, toFolder: string }> = new EventEmitter()
  @Output() delete: EventEmitter<string> = new EventEmitter()
  @Output() rename: EventEmitter<string> = new EventEmitter()

  displayedNotes: NoteInfo[] = []

  sortOptions = ['Name', 'Date Created', 'Date Last Modified']
  searchQuery: string = ''
  selectedSort = 0
  processing = false

  constructor(private mediaObserver: MediaObserver, private notesService: NotesService, private errorService: ErrorService) { }

  @ViewChild('grid') grid: MatGridList;
  gridByBreakpoint = {
    xl: 8,
    lg: 6,
    md: 4,
    sm: 2,
    xs: 1
  }

  ngOnInit(): void {
    try {
      let savedSort = Number.parseInt(localStorage.getItem(`sort-${this.list[this.fIndex].folder}`))
      this.selectedSort = isNaN(savedSort) ? 0 : savedSort
    } catch (err) {
      // Error if there was no saved value
    }
    this.refreshDisplayedNotes()
  }

  ngAfterContentInit() {
    this.mediaObserver.asObservable().subscribe((change: MediaChange[]) => {
      this.grid.cols = this.gridByBreakpoint[change[0].mqAlias];
    });
  }

  refreshDisplayedNotes() {
    this.processing = true
    localStorage.setItem(`sort-${this.list[this.fIndex].folder}`, this.selectedSort.toString())
    if (this.searchQuery.length > 0) {
      let queryWords = this.searchQuery.toLowerCase().split(' ')
      this.displayedNotes = this.list[this.fIndex].notes.map(note => {
        let searchHits = 0
        queryWords.forEach(word => note.fileName.toLowerCase().indexOf(word) >= 0 ? searchHits++ : null)
        return { note, searchHits }
      }).filter(result => result.searchHits > 0).sort((a, b) => a.searchHits - b.searchHits).map(result => result.note)
    } else {
      this.displayedNotes = this.list[this.fIndex].notes
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
    this.processing = false
  }

  deleteNote(folder: string, fileName: string) {
    if (confirm('Delete this file? This is permanent.')) {
      this.notesService.deleteNote(folder, fileName).then(() => {
        this.list[this.fIndex].notes = this.list[this.fIndex].notes.filter(note => note.fileName != fileName)
        this.refreshDisplayedNotes()
      }).catch(err => this.errorService.showError(err, () => this.deleteNote(folder, fileName)))
    }
  }

  renameNote(folder: string, fileName: string) {
    let newName = prompt('Enter new name')
    if (newName) {
      this.notesService.renameNote(folder, fileName, newName).then(() => {
        this.list[this.fIndex].notes = this.list[this.fIndex].notes.map(note => {
          if (note.fileName == fileName) note.fileName = newName.endsWith('.md') ? newName : newName + '.md'
          return note
        })
      }).catch(err => this.errorService.showError(err, () => this.renameNote(folder, fileName)))
    }
  }

  deleteThis() {
    this.delete.emit(this.list[this.fIndex].folder)
  }

  moveNote(folder: string, toFolder: string, fileName: string) {
    this.noteMover.emit({ folder, fileName, toFolder })
  }

  renameThis() {
    this.rename.emit(this.list[this.fIndex].folder)
  }
}
