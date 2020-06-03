import { Component, Input, Output, OnInit, ViewChild } from '@angular/core'
import { EventEmitter } from '@angular/core'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  @Input() data: string
  @Output() change: EventEmitter<string> = new EventEmitter<string>()

  startedEmpty: boolean = false

  ngOnInit() {
    this.startedEmpty = !this.data
  }

  changed() {
    this.change.emit(this.data)
  }
}
