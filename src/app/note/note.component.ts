import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { Note } from '../types';
import { ErrorService } from '../services/error.service';
import { NotesService } from '../services/notes.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit, OnDestroy {
  subs: Subscription[] = []
  note$: BehaviorSubject<Note> = new BehaviorSubject(null)
  loading: boolean = false
  new: boolean = true

  activeNote: { fileName: string, data: string } = null

  constructor(private route: ActivatedRoute, private notesService: NotesService, private errorService: ErrorService, private router: Router) { }

  getNote(folder: string, fileName: string) {
    this.loading = true
    this.new = false
    this.notesService.getNote(folder, fileName).then(note => {
      this.loading = false
      this.note$.next(note)
    }).catch(err => {
      this.loading = false
      this.note$.next(null)
      this.errorService.showError(err, () => this.getNote(folder, fileName))
    })
  }

  ngOnInit(): void {
    this.subs.push(this.note$.subscribe(note => {
      if (note) this.activeNote = { fileName: note.info.fileName, data: note.data }
    }))
    this.subs.push(this.route.paramMap.subscribe(params => {
      if (params.get('fileName')) {
        this.getNote(params.get('folder'), params.get('fileName'))
      } else {
        this.note$.next(new Note(params.get('folder')))
      }
    }))
  }

  save() {
    this.notesService.saveNote(this.activeNote.fileName, this.note$.value.folder, this.activeNote.data).then(() => {
      this.errorService.showError('Saved', null, 2000)
      this.new = false
    }).catch(err => {
      this.errorService.showError(err, () => this.save())
    })
  }

  delete() {
    if (!this.new) {
      this.notesService.deleteNote(this.note$.value.folder, this.note$.value.info.fileName).then(() => {
        this.errorService.showError('Deleted', null, 2000)
        this.new = true
        this.router.navigate(['/'])
      }).catch(err => {
        this.errorService.showError(err, () => this.delete())
      })
    }
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

}
