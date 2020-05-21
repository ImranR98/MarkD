import { Component, OnInit, Input, Output } from '@angular/core'
import { Item } from '../types'
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { EventEmitter } from '@angular/core'
import { ItemSheetComponent } from '../item-sheet/item-sheet.component'
import { DataService } from '../services/data.service'

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Item
  @Output() change: EventEmitter<Event> = new EventEmitter()
  @Output() delete: EventEmitter<string> = new EventEmitter()

  constructor(private bottomSheet: MatBottomSheet, private dataService: DataService) { }

  ngOnInit(): void {
    if (typeof this.item.due == 'string') this.item.due = new Date(Date.parse(this.item.due))
    if (typeof this.item.created == 'string') this.item.created = new Date(Date.parse(this.item.created))
    if (typeof this.item.modified == 'string') this.item.modified = new Date(Date.parse(this.item.modified))
  }

  somethingChanged(e: Event = null) {
    this.change.emit(e)
  }

  updateItemDateModified() {
    this.item.modified = new Date()
    this.somethingChanged()
  }

  openItem() {
    let bottomSheet = this.bottomSheet.open(ItemSheetComponent, {
      data: { item: this.item }
    })
    bottomSheet.instance.events.on('delete', () => {
      this.delete.emit('delete')
    })
    bottomSheet.instance.events.on('archive', () => {
      this.item.archived = !this.item.archived
      this.somethingChanged()
    })
    bottomSheet.instance.events.on('change', (args) => {
      this.somethingChanged(args[0])
      this.updateItemDateModified()
    })
  }

  formatDate(date: Date) {
    return this.dataService.formatDate(date)
  }

}
