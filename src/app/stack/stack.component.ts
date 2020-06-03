import { Component, OnInit, Input, Output } from '@angular/core'
import { Stack, Item } from '../types'
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { EventEmitter } from '@angular/core'

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss']
})
export class StackComponent implements OnInit {
  @Input() stack: Stack
  @Input() canMoveUp: boolean
  @Input() canMoveDown: boolean
  @Input() showArchived: boolean
  @Output() change: EventEmitter<Event> = new EventEmitter()
  @Output() delete: EventEmitter<string> = new EventEmitter()
  @Output() up: EventEmitter<string> = new EventEmitter()
  @Output() down: EventEmitter<string> = new EventEmitter()

  constructor() { }

  ngOnInit(): void {
  }

  somethingChanged(e: Event = null) {
    this.change.emit(e)
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex)
    }
    this.somethingChanged()
  }

  moveUp() {
    if (this.canMoveUp) this.up.emit('up')
  }

  moveDown() {
    if (this.canMoveDown) this.down.emit('down')
  }

  deleteThis() {
    this.delete.emit('delete')
  }

  archiveThis() {
    this.stack.archived = !this.stack.archived
    this.somethingChanged()
  }

  deleteItem(itemIndex: number) {
    if (confirm('Delete this Item?')) {
      this.stack.items.splice(itemIndex, 1)
      this.somethingChanged()
    }
  }

  addItem() {
    this.stack.items.push(new Item())
    this.somethingChanged()
  }

}
