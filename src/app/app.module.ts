import { BrowserModule } from '@angular/platform-browser'
import { NgModule, Injector } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MarkdownComponent } from './markdown/markdown.component'
import { EditorComponent } from './editor/editor.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatTabsModule } from '@angular/material/tabs'
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { AuthInterceptor } from './httpInterceptor'
import { LoginComponent } from './login/login.component'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatToolbarModule } from '@angular/material/toolbar'
import { CategoriesComponent } from './categories/categories.component'
import { HelpComponent } from './help/help.component'
import { NoteComponent } from './note/note.component'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatExpansionModule } from '@angular/material/expansion'
import { CategoryComponent } from './category/category.component'
import { MatSelectModule } from '@angular/material/select'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatRippleModule } from '@angular/material/core'
import { MatMenuModule } from '@angular/material/menu'

@NgModule({
  declarations: [
    AppComponent,
    MarkdownComponent,
    EditorComponent,
    LoginComponent,
    CategoriesComponent,
    HelpComponent,
    NoteComponent,
    CategoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    FlexLayoutModule,
    MatInputModule,
    MatDividerModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTabsModule,
    HttpClientModule,
    MatIconModule,
    MatTooltipModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatSelectModule,
    MatGridListModule,
    MatRippleModule,
    MatMenuModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
    deps: [Injector]
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
