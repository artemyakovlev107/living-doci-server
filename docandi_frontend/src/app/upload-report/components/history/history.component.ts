import { Component, OnInit, Input,Output,EventEmitter} from '@angular/core';
import * as moment from 'moment';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  @Input() data: any;
  @Output() back: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit() {
  }
  ngOnChanges() {
    if (this.data) {
      for (let i = 0; i < this.data.length; i++) {
        this.data[i].date = moment(this.data[i].date).format('MMM, YYYY');
        this.data[i].updated_at = moment(this.data[i].updated_at).format('MMM DD, YYYY')
      }
    }
  }
  gotoUpload() {
    this.back.emit(1);
  }
}
