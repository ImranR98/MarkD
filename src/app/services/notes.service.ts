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
    return await this.http.get(environment.apiUrl + '/list', this.httpOptions).toPromise() as FolderInfo[]
  }

  getNote = async (folder: string, fileName: string): Promise<Note> => {
    return await this.http.post(environment.apiUrl + `/note/get`, { folder, fileName }, this.httpOptions).toPromise() as Note
  }

  saveNote = async (fileName: string, folder: string, data: string) => {
    if (!fileName.endsWith('.md')) fileName += '.md'
    return await this.http.post(environment.apiUrl + `/note/save`, { folder, fileName, data }, this.httpOptions).toPromise()
  }

  deleteNote = async (folder: string, fileName: string) => {
    return await this.http.post(environment.apiUrl + `/note/delete`, { folder, fileName }, this.httpOptions)
  }

  createFolder = async (folder: string) => {
    return await this.http.post(environment.apiUrl + `/folder/create`, { folder }, this.httpOptions).toPromise()
  }

  deleteFolder = async (folder: string) => {
    return await this.http.post(environment.apiUrl + `/folder/delete`, { folder }, this.httpOptions).toPromise()
  }
}
