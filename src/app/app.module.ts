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
import { ItemComponent } from './item/item.component'
import { ItemSheetComponent } from './item-sheet/item-sheet.component'
import { StackComponent } from './stack/stack.component'
import { BoardComponent } from './board/board.component'
import { BoardsComponent } from './boards/boards.component'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { MatCardModule } from '@angular/material/card'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list'
import { MatBottomSheetModule } from '@angular/material/bottom-sheet'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment'

@NgModule({
  declarations: [
    AppComponent,
    MarkdownComponent,
    EditorComponent,
    LoginComponent,
    CategoriesComponent,
    HelpComponent,
    NoteComponent,
    CategoryComponent,
    ItemComponent,
    ItemSheetComponent,
    StackComponent,
    BoardComponent,
    BoardsComponent
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
    MatMenuModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatBottomSheetModule,
    MatListModule,
    MatSidenavModule,
    MatCardModule,
    DragDropModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
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
