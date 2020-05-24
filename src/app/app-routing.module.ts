import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { LoginComponent } from './login/login.component'
import { CategoriesComponent } from './categories/categories.component'
import { AuthService } from './services/auth.service'
import { HelpComponent } from './help/help.component'
import { NoteComponent } from './note/note.component'
import { CategoryComponent } from './category/category.component'
import { BoardsComponent } from './boards/boards.component'


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/login'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'deck',
    component: BoardsComponent,
    canActivate: [AuthService]
  },
  {
    path: 'notes',
    component: CategoriesComponent,
    canActivate: [AuthService]
  },
  {
    path: 'notes/category',
    component: CategoryComponent
  },
  {
    path: 'notes/category/:category',
    component: CategoryComponent
  },
  {
    path: 'notes/note',
    component: NoteComponent,
    canActivate: [AuthService]
  },
  {
    path: 'notes/note/:category',
    component: NoteComponent,
    canActivate: [AuthService]
  },
  {
    path: 'notes/note/:category/:fileName',
    component: NoteComponent,
    canActivate: [AuthService]
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: '**',
    redirectTo: '/login'
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
