import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { Note } from '../types';
import { ErrorService } from '../services/error.service';
import { DataService } from '../services/data.service';

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

  constructor(private route: ActivatedRoute, private notesService: DataService, private errorService: ErrorService, private router: Router) { }

  getNote(category: string, fileName: string) {
    this.loading = true
    this.new = false
    this.notesService.getNote(category, fileName).then(note => {
      this.loading = false
      this.note$.next(note)
    }).catch(err => {
      this.loading = false
      this.note$.next(null)
      this.errorService.showError(err, () => this.getNote(category, fileName), null)
    })
  }

  ngOnInit(): void {
    this.subs.push(this.note$.subscribe(note => {
      if (note) this.activeNote = { fileName: note.info.fileName, data: note.data }
    }))
    this.subs.push(this.route.paramMap.subscribe(params => {
      if (params.get('fileName')) {
        this.getNote(params.get('category'), params.get('fileName'))
      } else {
        this.note$.next(new Note(params.get('category')))
      }
    }))
  }

  changed(e) {
    this.activeNote.data = e.target.value
  }

  save() {
    this.notesService.saveNote(this.activeNote.fileName, this.note$.value.category, this.activeNote.data).then(() => {
      this.errorService.showError('Saved', null)
      if (!this.activeNote.fileName.endsWith('.md')) this.activeNote.fileName += '.md'
      this.new = false
    }).catch(err => {
      this.errorService.showError(err, () => this.save())
    })
  }

  delete() {
    if (!this.new) {
      if (confirm('Delete this file? This is permanent.')) {
        this.notesService.deleteNote(this.note$.value.category, this.note$.value.info.fileName).then(() => {
          this.errorService.showError('Deleted')
          this.new = true
          this.router.navigate(['/'])
        }).catch(err => {
          this.errorService.showError(err, () => this.delete())
        })
      }
    }
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

}
