import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NoteInfo, Note, FolderInfo } from '../types';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true // Make sure JWT header is sent
  }

  list = async (): Promise<FolderInfo[]> => {
    let folders = await this.http.get(environment.apiUrl + '/list', this.httpOptions).toPromise() as FolderInfo[]
    folders = folders.map(folder => {
      folder.notes = folder.notes.map(note => {
        typeof note.created == 'string' ? note.created = new Date(note.created) : null
        typeof note.modified == 'string' ? note.modified = new Date(note.modified) : null
        return note
      })
      return folder
    })
    return folders
  }

  getNote = async (folder: string, fileName: string): Promise<Note> => {
    let note = await this.http.post(environment.apiUrl + `/note/get`, { folder, fileName }, this.httpOptions).toPromise() as Note
    typeof note.info.created == 'string' ? note.info.created = new Date(note.info.created) : null
    typeof note.info.modified == 'string' ? note.info.modified = new Date(note.info.modified) : null
    return note
  }

  saveNote = async (fileName: string, folder: string, data: string) => {
    if (!fileName.endsWith('.md')) fileName += '.md'
    return await this.http.post(environment.apiUrl + `/note/save`, { folder, fileName, data }, this.httpOptions).toPromise()
  }

  deleteNote = async (folder: string, fileName: string) => {
    return await this.http.post(environment.apiUrl + `/note/delete`, { folder, fileName }, this.httpOptions).toPromise()
  }

  moveNote = async (folder: string, toFolder: string, fileName: string) => {
    return await this.http.post(environment.apiUrl + `/note/move`, { folder, fileName, toFolder }, this.httpOptions).toPromise()
  }

  renameNote = async (folder: string, fileName: string, newName: string) => {
    if (!newName.endsWith('.md')) newName += '.md'
    return await this.http.post(environment.apiUrl + `/note/rename`, { folder, fileName, newName }, this.httpOptions).toPromise()
  }

  createFolder = async (folder: string) => {
    return await this.http.post(environment.apiUrl + `/folder/create`, { folder }, this.httpOptions).toPromise()
  }

  deleteFolder = async (folder: string) => {
    return await this.http.post(environment.apiUrl + `/folder/delete`, { folder }, this.httpOptions).toPromise()
  }

  renameFolder = async (folder: string, newFolder: string) => {
    return await this.http.post(environment.apiUrl + `/folder/rename`, { folder, newFolder }, this.httpOptions).toPromise()
  }
}
