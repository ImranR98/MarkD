import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NotesComponent } from './notes/notes.component';
import { AuthService } from './services/auth.service';
import { HelpComponent } from './help/help.component';
import { NoteComponent } from './note/note.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/notes'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'notes',
    component: NotesComponent,
    canActivate: [AuthService]
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
    redirectTo: '/notes'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
