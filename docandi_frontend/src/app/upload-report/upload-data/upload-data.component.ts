import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-upload-data',
  templateUrl: './upload-data.component.html',
  styleUrls: ['./upload-data.component.css']
})
export class UploadDataComponent implements OnInit {
  step: any = 1;
  constructor() { }
  contentFields: any;
  history:any;
  ngOnInit() {
  }
  getContentFile(fields: any) {
    this.contentFields = fields;
    this.step = 2;
  }
  nextToStep3(event: any) {
    this.step = 3;
  }
  gotoStep(step: any) {
    this.step = step;
  }
  backToSep2(event: any) {
    this.step = 2;
  }
  onGetHistory(data:any){
    this.history = data;
    console.log(this.history)
  }
}
