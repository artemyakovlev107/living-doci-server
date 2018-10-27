import { CommonDataService } from './../../../shared/services/common-data.service';
import { UploadServiceService } from './../../upload-service.service';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as moment from 'moment';
@Component({
  selector: 'app-file-review',
  templateUrl: './file-review.component.html',
  styleUrls: ['./file-review.component.css']
})
export class FileReviewComponent implements OnInit {
  @Output() back: EventEmitter<any> = new EventEmitter<any>();
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @Output() submited: EventEmitter<any> = new EventEmitter<any>();
  currentFileName: any;
  @Input() data: any;
  date: any;
  reconciliation: any;
  total: any;
  increased: any;
  viewReport: any = false;

  ngOnChanges() {
    if (this.data) {
      this.total = this.data.fields.total;
      this.reconciliation = this.data.fields.reconciliation;
      this.increased = this.data.fields.netIncrease;
      this.date = moment(this.data.timePeriod).format('MMM, YYYY');
      this.currentFileName = this.data.fields.currentFileName;
      console.log("currentFileName", this.currentFileName)
    }

  }
  constructor(private service: UploadServiceService, private common: CommonDataService) { }

  ngOnInit() {
    this.currentFileName = {
      three40bFile: null,
      EMRFile: null
    };
    this.date = { date: { year: 2018, month: 10, day: 9 } };
  }
  onDateChanged(date: any) {
    console.log(date)
  }
  backtoStep2() {
    this.back.emit(2);
  }
  gotoUpload() {
    this.back.emit(1);
  }
  submit() {
    this.common.toggleLoading(true)
    this.service.getHistory().subscribe(data => {
      this.common.toggleLoading(false)
      if (data.Status == "success") {
        this.next.emit(4);
        this.submited.next(data.Data)
      } else {
        alert(data.Message)
      }
    }, err => {
      alert('Server error')
      this.common.toggleLoading(false)
    })
  }
}

