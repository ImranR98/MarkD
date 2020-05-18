import { Component, Input } from '@angular/core';
import { NoteInfo } from '../types';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  @Input() data: string
}
