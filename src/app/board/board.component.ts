import { Component, OnInit, Input, Output } from '@angular/core'
import { Board, Stack } from '../types'
import { EventEmitter } from '@angular/core'
import { moveItemInArray } from '@angular/cdk/drag-drop'

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  @Input() board: Board
  @Output() change: EventEmitter<Event> = new EventEmitter()
  @Output() delete: EventEmitter<string> = new EventEmitter()
  @Output() toggleBoards: EventEmitter<string> = new EventEmitter()

  constructor() { }

  ngOnInit(): void {
  }

  somethingChanged(e: Event = null) {
    this.change.emit(e)
  }

  deleteThis() {
    this.delete.emit('delete')
  }

  archiveThis() {
    this.board.archived = !this.board.archived
    this.somethingChanged()
  }

  deleteStack(stackIndex: number) {
    this.board.stacks.splice(stackIndex, 1)
    this.somethingChanged()
  }

  addStack() {
    this.board.stacks.push(new Stack())
    this.somethingChanged()
  }

  moveStackUp(stackIndex: number) {
    moveItemInArray(this.board.stacks, stackIndex, stackIndex - 1)
    this.somethingChanged()
  }

  moveStackDown(stackIndex: number) {
    moveItemInArray(this.board.stacks, stackIndex, stackIndex + 1)
    this.somethingChanged()
  }

  toggleBoardsFn() {
    this.toggleBoards.emit('toggle')
  }
}
