import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NotesComponent } from './notes/notes.component';
import { AuthService } from './services/auth.service';
import { HelpComponent } from './help/help.component';
import { NoteComponent } from './note/note.component';
import { FolderComponent } from './folder/folder.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/folders'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'folders',
    component: NotesComponent,
    canActivate: [AuthService]
  },
  {
    path: 'folder',
    component: FolderComponent
  },
  {
    path: 'folder/:folder',
    component: FolderComponent
  },
  {
    path: 'note',
    component: NoteComponent,
    canActivate: [AuthService]
  },
  {
    path: 'note/:folder',
    component: NoteComponent,
    canActivate: [AuthService]
  },
  {
    path: 'note/:folder/:fileName',
    component: NoteComponent,
    canActivate: [AuthService]
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: '**',
    redirectTo: '/folders'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
