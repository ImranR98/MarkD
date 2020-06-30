import { Injectable, EventEmitter } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { Board, Note, CategoryInfo } from '../types'

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }

  toggleDeckNav: EventEmitter<null> = new EventEmitter<null>()

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true // Make sure JWT header is sent
  }

  toggleDeckNavEvent() {
    this.toggleDeckNav.emit(null)
  }

  findMaxDaysBetweenDates(date1: Date, date2: Date): number {
    let tDate2 = new Date(date2.getTime())
    tDate2.setHours(date1.getHours(), date1.getMinutes(), date1.getSeconds(), date1.getMilliseconds())
    return Math.ceil((tDate2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24))
  }

  getNaturalDaysString(days: number): string {
    const genStr = (num: number, unit: string): string => {
      if (num >= 0) {
        return `In ${num} ${Math.abs(num) == 1 ? unit : unit + 's'}`
      } else {
        return `${num * -1} ${Math.abs(num) == 1 ? unit : unit + 's'} ago`
      }
    }
    if (days == 0) return 'Today'
    if (days == 1) return 'Tomorrow'
    if (days == -1) return 'Yesterday'
    let absDays = Math.abs(days)
    if (absDays < 30) return genStr(days, 'day')
    if (absDays >= 30 && absDays < 365) {
      if (days >= 30 && days < 45) return 'In a month'
      if (days <= -30 && days > -45) return 'A month ago'
      return genStr(Math.round(((days / 30) + Number.EPSILON) * 10) / 10, 'month')
    }
    if (days >= 365 && days < 545) return 'In a year'
    if (days <= -365 && days > -545) return 'An year ago'
    return genStr(Math.round(((days / 365) + Number.EPSILON) * 10) / 10, 'year')
  }

  formatDate(date: Date, naturalString: boolean = false, time: boolean = true): string {
    if (naturalString) return this.getNaturalDaysString(this.findMaxDaysBetweenDates(new Date(), date))
    if (!time) return date.toDateString()
    return date.toDateString() + ', ' + (date.getHours() > 12 || date.getHours() == 0 ? date.getHours() == 0 ? 12 : date.getHours() - 12 : date.getHours()) + (date.getMinutes() == 0 ? '' : date.getMinutes() <= 9 ? ':0' + date.getMinutes() : ':' + date.getMinutes()) + ' ' + (date.getHours() >= 12 ? 'PM' : 'AM')
  }

  getDateClass(date: Date) {
    let diff = this.findMaxDaysBetweenDates(new Date(), date)
    if (diff > 0 && diff <= 7) return 'bold'
    if (diff == 0) return 'orange bold'
    if (diff < 0) return 'red bold'
    return ''
  }

  getBoards = async (): Promise<any> => {
    return await this.http.get(environment.apiUrl + '/boards', this.httpOptions).toPromise()
  }

  setBoards = async (boards: Board[]) => {
    return await this.http.post(environment.apiUrl + '/boards', { boards }, this.httpOptions).toPromise()
  }

  getCategories = async (): Promise<{ category: string, categories: string[] }[]> => {
    return await this.http.get(environment.apiUrl + '/categories', this.httpOptions).toPromise() as { category: string, categories: string[] }[]
  }

  getNote = async (category: string, fileName: string): Promise<Note> => {
    let note = await this.http.post(environment.apiUrl + `/note/get`, { category, fileName }, this.httpOptions).toPromise() as Note
    typeof note.info.created == 'string' ? note.info.created = new Date(note.info.created) : null
    typeof note.info.modified == 'string' ? note.info.modified = new Date(note.info.modified) : null
    return note
  }

  getCategory = async (category: string): Promise<{ category: CategoryInfo, categories: string[] }> => {
    let categoryObj = await this.http.post(environment.apiUrl + `/category/get`, { category }, this.httpOptions).toPromise() as { category: CategoryInfo, categories: string[] }
    categoryObj.category.categories = categoryObj.category.categories.map(note => {
      typeof note.created == 'string' ? note.created = new Date(note.created) : null
      typeof note.modified == 'string' ? note.modified = new Date(note.modified) : null
      return note
    })
    return categoryObj
  }

  saveNote = async (fileName: string, category: string, data: string) => {
    if (!fileName.endsWith('.md')) fileName += '.md'
    return await this.http.post(environment.apiUrl + `/note/save`, { category, fileName, data }, this.httpOptions).toPromise()
  }

  deleteNote = async (category: string, fileName: string) => {
    return await this.http.post(environment.apiUrl + `/note/delete`, { category, fileName }, this.httpOptions).toPromise()
  }

  moveNote = async (category: string, toCategory: string, fileName: string) => {
    return await this.http.post(environment.apiUrl + `/note/move`, { category, fileName, toCategory }, this.httpOptions).toPromise()
  }

  renameNote = async (category: string, fileName: string, newName: string) => {
    if (!newName.endsWith('.md')) newName += '.md'
    return await this.http.post(environment.apiUrl + `/note/rename`, { category, fileName, newName }, this.httpOptions).toPromise()
  }

  createCategory = async (category: string) => {
    return await this.http.post(environment.apiUrl + `/category/create`, { category }, this.httpOptions).toPromise()
  }

  deleteCategory = async (category: string) => {
    return await this.http.post(environment.apiUrl + `/category/delete`, { category }, this.httpOptions).toPromise()
  }

  renameCategory = async (category: string, newCategory: string) => {
    return await this.http.post(environment.apiUrl + `/category/rename`, { category, newCategory }, this.httpOptions).toPromise()
  }

  getLastVisitedPage() {
    return localStorage.getItem('lastVisited')
  }

  setLastVisitedPage(page: string) {
    return localStorage.setItem('lastVisited', page)
  }
}
