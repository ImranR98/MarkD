import { Component, OnInit, Input } from '@angular/core';
import { FolderInfo, NoteInfo, Note } from '../types';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  @Input() folder: FolderInfo

  displayedNotes: NoteInfo[] = []

  sortOptions = ['Name', 'Date Created', 'Date Last Modified']
  searchQuery: string = ''
  selectedSort = 0
  processing = false

  constructor() { }

  ngOnInit(): void {
    try {
      let savedSort = Number.parseInt(localStorage.getItem(`sort-${this.folder.folder}`))
      this.selectedSort = isNaN(savedSort) ? 0 : savedSort
    } catch (err) {
      // Error if there was no saved value
    }
    this.refreshDisplayedNotes()
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
      case 1:
        this.displayedNotes = this.displayedNotes.sort((a, b) => b.modified.toString().localeCompare(a.modified.toString()))
        break;
      default:
        this.displayedNotes = this.displayedNotes.sort((a, b) => b.created.toString().localeCompare(a.created.toString()))
        break;
    }
    this.processing = false
  }

}
