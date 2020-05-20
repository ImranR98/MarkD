import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { CategoryInfo, NoteInfo, Note } from '../types';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatGridList } from '@angular/material/grid-list';
import { DataService } from '../services/data.service';
import { ErrorService } from '../services/error.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  subs: Subscription[] = []
  category$: BehaviorSubject<CategoryInfo> = new BehaviorSubject(null)
  categories$: BehaviorSubject<string[]> = new BehaviorSubject([])

  displayedCategories: NoteInfo[] = []

  sortOptions = ['Name', 'Date Created', 'Date Last Modified']
  searchQuery: string = ''
  selectedSort = 0

  constructor(private route: ActivatedRoute, private mediaObserver: MediaObserver, private notesService: DataService, private errorService: ErrorService, private router: Router) { }

  @ViewChild('grid') grid: MatGridList;
  gridByBreakpoint = {
    xl: 8,
    lg: 6,
    md: 4,
    sm: 2,
    xs: 1
  }

  getCategory(category: string) {
    this.notesService.getCategory(category).then(category => {
      this.category$.next(category.category)
      this.categories$.next(category.categories)
    }).catch(err => {
      this.category$.next(null)
      this.categories$.next([])
      this.errorService.showError(err, () => this.getCategory(category), null)
    })
  }

  changeGridSize(cols: number) {
    if (this.grid) this.grid.cols = cols
    else setTimeout(() => {
      this.changeGridSize(cols)
    })
  }

  ngOnInit(): void {
    this.subs.push(this.category$.subscribe(category => {
      this.refreshDisplayedCategories()
    }))
    this.subs.push(this.route.paramMap.subscribe(params => {
      this.getCategory(params.get('category'))
    }))
    this.subs.push(this.mediaObserver.asObservable().subscribe((change: MediaChange[]) => {
      this.changeGridSize(this.gridByBreakpoint[change[0].mqAlias])
      if (this.grid) this.grid.cols = this.gridByBreakpoint[change[0].mqAlias]
    }))
  }

  refreshDisplayedCategories() {
    if (this.category$.value) {
      localStorage.setItem(`sort-${this.category$.value.category}`, this.selectedSort.toString())
      if (this.searchQuery.length > 0) {
        let queryWords = this.searchQuery.toLowerCase().split(' ')
        this.displayedCategories = this.category$.value.categories.map(note => {
          let searchHits = 0
          queryWords.forEach(word => note.fileName.toLowerCase().indexOf(word) >= 0 ? searchHits++ : null)
          return { note, searchHits }
        }).filter(result => result.searchHits > 0).sort((a, b) => a.searchHits - b.searchHits).map(result => result.note)
      } else {
        this.displayedCategories = this.category$.value.categories
      }
      switch (this.selectedSort) {
        case 0:
          this.displayedCategories = this.displayedCategories.sort((a, b) => a.fileName.localeCompare(b.fileName))
          break;
        case 1:
          this.displayedCategories = this.displayedCategories.sort((a, b) => b.created.toString().localeCompare(a.created.toString()))
          break;
        case 2:
          this.displayedCategories = this.displayedCategories.sort((a, b) => b.modified.toString().localeCompare(a.modified.toString()))
          break;
        default:
          this.displayedCategories = this.displayedCategories.sort((a, b) => b.modified.toString().localeCompare(a.modified.toString()))
          break;
      }
    }
  }

  deleteNote(category: string, fileName: string) {
    if (confirm('Delete this file? This is permanent.')) {
      this.notesService.deleteNote(category, fileName).then(() => {
        this.category$.value.categories = this.category$.value.categories.filter(note => note.fileName != fileName)
        this.refreshDisplayedCategories()
      }).catch(err => this.errorService.showError(err, () => this.deleteNote(category, fileName)))
    }
  }

  renameNote(category: string, fileName: string) {
    let newName = prompt('Enter new name')
    if (newName) {
      this.notesService.renameNote(category, fileName, newName).then(() => {
        this.category$.value.categories = this.category$.value.categories.map(note => {
          if (note.fileName == fileName) note.fileName = newName.endsWith('.md') ? newName : newName + '.md'
          return note
        })
      }).catch(err => this.errorService.showError(err, () => this.renameNote(category, fileName)))
    }
  }

  moveNote(category: string, toCategory: string, fileName: string) {
    this.notesService.moveNote(category, toCategory, fileName).then(() => {
      this.category$.value.categories = this.category$.value.categories.filter(note => note.fileName != fileName)
      this.refreshDisplayedCategories()
    }).catch(err => this.errorService.showError(err, () => this.moveNote(category, toCategory, fileName)))
  }

  formatDate(date: Date) {
    return date.toDateString() + ', ' + (date.getHours() > 12 || date.getHours() == 0 ? date.getHours() == 0 ? 12 : date.getHours() - 12 : date.getHours()) + (date.getMinutes() == 0 ? '' : date.getMinutes() <= 9 ? ':0' + date.getMinutes() : ':' + date.getMinutes()) + ' ' + (date.getHours() > 12 ? 'PM' : 'AM')
  }
}
