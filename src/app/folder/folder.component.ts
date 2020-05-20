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
  @Input() folder: FolderInfo
  @Input() list: FolderInfo[]
  @Output() noteMover: EventEmitter<{ folder: string, fileName: string, toFolder: string }> = new EventEmitter()

  displayedNotes: NoteInfo[] = []

  sortOptions = ['Name', 'Date Created', 'Date Last Modified']
  searchQuery: string = ''
  selectedSort = 0
  processing = false

  constructor(private mediaObserver: MediaObserver, private noteService: NotesService, private errorService: ErrorService) { }

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
      let savedSort = Number.parseInt(localStorage.getItem(`sort-${this.folder.folder}`))
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
    localStorage.setItem(`sort-${this.folder.folder}`, this.selectedSort.toString())
    if (this.searchQuery.length > 0) {
      let queryWords = this.searchQuery.toLowerCase().split(' ')
      this.displayedNotes = this.folder.notes.map(note => {
        let searchHits = 0
        queryWords.forEach(word => note.fileName.toLowerCase().indexOf(word) >= 0 ? searchHits++ : null)
        return { note, searchHits }
      }).filter(result => result.searchHits > 0).sort((a, b) => a.searchHits - b.searchHits).map(result => result.note)
    } else {
      this.displayedNotes = this.folder.notes
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

  delete(folder: string, fileName: string) {
    if (confirm('Delete this file? This is permanent.')) {
      this.noteService.deleteNote(folder, fileName).then(() => {
        this.folder.notes = this.folder.notes.filter(note => note.fileName != fileName)
        this.refreshDisplayedNotes()
      }).catch(err => this.errorService.showError(err, () => this.delete(folder, fileName)))
    }
  }

  deleteThis() {
    this.noteService.deleteFolder(this.folder.folder).then(() => {
      // Should disappear
    }).catch(err => this.errorService.showError(err, () => this.deleteThis()))
  }

  moveNote(folder: string, toFolder: string, fileName: string) {
    this.noteMover.emit({ folder, fileName, toFolder })
  }

  renameNote(folder: string, newFolder: string) {
    this.noteService.renameFolder(folder, newFolder).then(() => {

    }).catch(err => this.errorService.showError(err, () => this.renameNote(folder, newFolder)))
  }
}
