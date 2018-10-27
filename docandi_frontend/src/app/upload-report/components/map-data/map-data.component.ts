import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-map-data',
  templateUrl: './map-data.component.html',
  styleUrls: ['./map-data.component.css']
})
export class MapDataComponent implements OnInit {
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @Input() data:any;
  fields:any = [];
  constructor() { }

  ngOnInit() {
  }
  ngOnChanges(){
    this.fields = this.data.fields.listAtribute
  }
  nextStep() {
    this.next.emit(3);
  }
}
