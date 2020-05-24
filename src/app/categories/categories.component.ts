import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { DataService } from '../services/data.service'
import { ErrorService } from '../services/error.service'
import { BehaviorSubject, Subscription } from 'rxjs'
import { MediaObserver, MediaChange } from '@angular/flex-layout'
import { MatGridList } from '@angular/material/grid-list'

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {

  constructor(private dataService: DataService, private mediaObserver: MediaObserver, private errorService: ErrorService) { }

  subs: Subscription[] = []

  @ViewChild('grid') grid: MatGridList
  gridByBreakpoint = {
    xl: 8,
    lg: 6,
    md: 4,
    sm: 2,
    xs: 1
  }

  categories$: BehaviorSubject<{ category: string, categories: string[] }[]> = new BehaviorSubject(null)

  categories: { category: string, categories: string[] }[] = null

  currentlyOpen = null

  changeGridSize(cols: number) {
    if (this.grid) this.grid.cols = cols
    else setTimeout(() => {
      this.changeGridSize(cols)
    })
  }

  getCategories() {
    this.dataService.getCategories().then((categories: { category: string, categories: string[] }[]) => {
      this.categories$.next(categories)
    }).catch(err => {
      this.categories$.next(null)
      this.errorService.showError(err, () => this.getCategories(), null)
    })
  }

  openedCategory(category: string) {
    this.currentlyOpen = category
    localStorage.setItem('openCategory', category)
  }

  closedCategory(category: string) {
    if (localStorage.getItem('openCategory') === category) localStorage.removeItem('openCategory')
  }

  addCategory(newCategory: string = '') {
    if (!newCategory) {
      newCategory = prompt('Enter Category Name')
    }
    let exists = false
    this.categories.forEach(category => category.category.trim() == newCategory.trim() ? exists = true : null)
    if (exists) {
      this.errorService.showError(`${newCategory.trim()} already exists`)
    } else {
      this.dataService.createCategory(newCategory).then(() => {
        this.categories.push({ category: newCategory, categories: [] })
      }).catch(err => {
        this.errorService.showError(err, () => this.addCategory(newCategory))
      })
    }
  }

  moveNote(e: { category: string, fileName: string, toCategory: string }) {
    this.dataService.moveNote(e.category, e.toCategory, e.fileName).then(() => {
      this.ngOnInit()
    }).catch(err => {
      this.errorService.showError(err, () => this.moveNote({ category: e.category, fileName: e.fileName, toCategory: e.toCategory }))
    })
  }

  deleteCategory(category: string) {
    this.dataService.deleteCategory(category).then(() => {
      this.categories = this.categories.filter(lCategory => lCategory.category != category)
    }).catch(err => this.errorService.showError(err, () => this.deleteCategory(category)))
  }

  renameCategory(category: string) {
    let newName = prompt('Enter new name')
    if (newName) {
      this.dataService.renameCategory(category, newName).then(() => {
        this.categories = this.categories.map(lCategory => {
          if (lCategory.category == category) lCategory.category = newName
          return lCategory
        })
      }).catch(err => this.errorService.showError(err, () => this.renameCategory(category)))
    }
  }

  ngOnInit(): void {
    this.dataService.setLastVisitedPage('notes')
    this.currentlyOpen = localStorage.getItem('openCategory')
    this.subs.push(this.categories$.subscribe(list => {
      this.categories = list
    }))
    this.subs.push(this.mediaObserver.asObservable().subscribe((change: MediaChange[]) => {
      this.changeGridSize(this.gridByBreakpoint[change[0].mqAlias])
      if (this.grid) this.grid.cols = this.gridByBreakpoint[change[0].mqAlias]
    }))
    this.getCategories()
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

}
