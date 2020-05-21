import { Component, Input, Output } from '@angular/core'
import { EventEmitter } from '@angular/core'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  @Input() data: string
  @Output() change: EventEmitter<string> = new EventEmitter<string>()

  changed() {
    this.change.emit(this.data)
  }
}
