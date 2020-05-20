import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CategoriesComponent } from './categories/categories.component';
import { AuthService } from './services/auth.service';
import { HelpComponent } from './help/help.component';
import { NoteComponent } from './note/note.component';
import { CategoryComponent } from './category/category.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/categories'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'categories',
    component: CategoriesComponent,
    canActivate: [AuthService]
  },
  {
    path: 'category',
    component: CategoryComponent
  },
  {
    path: 'category/:category',
    component: CategoryComponent
  },
  {
    path: 'note',
    component: NoteComponent,
    canActivate: [AuthService]
  },
  {
    path: 'note/:category',
    component: NoteComponent,
    canActivate: [AuthService]
  },
  {
    path: 'note/:category/:fileName',
    component: NoteComponent,
    canActivate: [AuthService]
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: '**',
    redirectTo: '/categories'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
