import { Component, OnInit, Input } from '@angular/core';
import { FolderInfo, NoteInfo } from '../types';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  @Input() folder: FolderInfo

  displayedNotes: NoteInfo[] = null

  sortOptions = ['Name', 'Date Created', 'Date Last Modified']
  searchQuery: string = ''
  selectedSort = 0

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
    localStorage.setItem(`sort-${this.folder.folder}`, this.selectedSort.toString())
    this.displayedNotes = this.folder.notes
  }

}
