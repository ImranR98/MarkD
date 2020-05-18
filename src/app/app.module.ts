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
import { NotesComponent } from './notes/notes.component'
import { HelpComponent } from './help/help.component'
import { NoteComponent } from './note/note.component'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatProgressBarModule, MatProgressBar } from '@angular/material/progress-bar'

@NgModule({
  declarations: [
    AppComponent,
    MarkdownComponent,
    EditorComponent,
    LoginComponent,
    NotesComponent,
    HelpComponent,
    NoteComponent
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
    MatProgressBarModule
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
