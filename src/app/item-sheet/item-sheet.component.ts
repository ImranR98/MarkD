import { Component, OnInit, Inject, Output } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Item } from '../types';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-item-sheet',
  templateUrl: './item-sheet.component.html',
  styleUrls: ['./item-sheet.component.scss']
})
export class ItemSheetComponent implements OnInit {

  constructor(private bottomSheetRef: MatBottomSheetRef<ItemSheetComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: { item: Item }) { }

  @Output() events: EventEmitter = new EventEmitter()
  ready: boolean = false

  ngOnInit(): void {
    if (!this.data.item) this.bottomSheetRef.dismiss()
  }

  somethingChanged(e: Event = null) {
    this.events.emit('change', [e])
  }

  deleteThis() {
    this.events.emit('delete')
    this.bottomSheetRef.dismiss()
  }

  archiveThis() {
    this.events.emit('archive')
  }

  formatDate(date: Date) {
    return date.toDateString() + ', ' + (date.getHours() > 12 || date.getHours() == 0 ? date.getHours() == 0 ? 12 : date.getHours() - 12 : date.getHours()) + (date.getMinutes() == 0 ? '' : date.getMinutes() <= 9 ? ':0' + date.getMinutes() : ':' + date.getMinutes()) + ' ' + (date.getHours() > 12 ? 'PM' : 'AM')
  }

}
