import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { Board, Note, CategoryInfo } from '../types'

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true // Make sure JWT header is sent
  }

  formatDate(date: Date) {
    return date.toDateString() + ', ' + (date.getHours() > 12 || date.getHours() == 0 ? date.getHours() == 0 ? 12 : date.getHours() - 12 : date.getHours()) + (date.getMinutes() == 0 ? '' : date.getMinutes() <= 9 ? ':0' + date.getMinutes() : ':' + date.getMinutes()) + ' ' + (date.getHours() > 12 ? 'PM' : 'AM')
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
}
