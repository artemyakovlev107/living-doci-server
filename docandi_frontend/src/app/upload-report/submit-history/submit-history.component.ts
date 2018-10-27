import { CommonDataService } from './../../shared/services/common-data.service';
import { Router } from '@angular/router';
import { UploadServiceService } from './../upload-service.service';
import { Component, OnInit } from '@angular/core';
declare const $: any;
@Component({
  selector: 'app-submit-history',
  templateUrl: './submit-history.component.html',
  styleUrls: ['./submit-history.component.css']
})

export class SubmitHistoryComponent implements OnInit {

  rowsOnPage:number;
  constructor(private service: UploadServiceService, private router: Router, private common: CommonDataService) { }
  history: any;
  flagItemDelete: any;
  currentFile: any;
  currentFileDelete: any;
  currentFileTypeDelete: any
  ngOnInit() {
    this.getHistory();
  }
  getHistory() {
    this.common.toggleLoading(true);
    this.service.getSubmitHistory().subscribe((res) => {
      this.common.toggleLoading(false);
      if (res.Status == "access is denied") {
        localStorage.clear();
        this.router.navigate(['/', 'login']);
      } else {
        this.history = res.Data;
        this.rowsOnPage = this.history.length;

      }
    }, (err) => {
      this.common.toggleLoading(false);
    })
  }
  confirmDelete(data: any) {
    console.log(data);
    this.flagItemDelete = data;
    $('#confirmDelete').modal('show');
  }
  deleteHistory() {
    this.service.deleteHistory(this.flagItemDelete.time).subscribe(res => {
      $('#confirmDelete').modal('hide');
      if (res.Status == "access is denied") {
        localStorage.clear();
        this.router.navigate(['/', 'login']);
      } else {
        this.getHistory();
      }
    })
  }
  uploadfile(type: any, event: any, time: any, base_line: any) {
    this.common.toggleLoading(true);
    let file = event.target.files[0];
    console.log(file);
    console.log(event);
    console.log(time);
    console.log(base_line);
    this.service.uploadspecific(file, type, time, base_line).subscribe(data => {
      console.log(data);
      this.common.toggleLoading(false);
      this.getHistory();
    },(err)=>{
      this.common.toggleLoading(false);
    });
  }
  confirmDeleteFile(item: any, type: any) {
    this.currentFile = item;
    // this.currentFileDelete = item.time;
    this.currentFileTypeDelete = type;
    $('#confirmDeleteFile').modal('show');
  }
  deleteFile() {
    $('#confirmDeleteFile').modal('hide');
    this.common.toggleLoading(true);
    this.service.deletespecific(this.currentFile.time, this.currentFileTypeDelete, this.currentFile.is_base_line).subscribe((res: any) => {
      this.common.toggleLoading(false);
      if (res.Status == "access is denied") {
        localStorage.clear();
        this.router.navigate(['/', 'login']);
      } else {
        this.getHistory();
      }
    },err=>{
      this.common.toggleLoading(false);
    })
  }
}
