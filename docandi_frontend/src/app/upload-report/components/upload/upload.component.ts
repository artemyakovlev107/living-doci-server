import { CommonDataService } from './../../../shared/services/common-data.service';
import { Component, OnInit, NgZone, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemFileEntry } from 'ngx-file-drop';
import { interval } from 'rxjs';
import { UploadServiceService } from '../../upload-service.service';
declare const $: any;
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  public files: UploadFile[] = [];
  public three40bFile: any;
  public step: number = 1;
  public progress: number = 0;
  error:any;
  retail_net_increased_access_dollars:any;
  public currentFileName: {
    three40bFile: string;
    EMRFile: string;
  };
  currentTypeDrop: number = 1;
  // 1 is 340 B file, 2 is ERM file
  public errorText: string;
  public EMRFile: any;
  public uploadERM: any;
  @Output() dataUpload: EventEmitter<any> = new EventEmitter<any>();
  myStyle: any;
  constructor(private zone: NgZone, private cdr: ChangeDetectorRef, private service: UploadServiceService, private common: CommonDataService) { }
  ngOnInit() {
    this.refreshFile();
  }
  public refreshFile() {
    this.three40bFile = null;
    this.EMRFile = null;
    this.currentFileName = {
      three40bFile: null,
      EMRFile: null
    };
  }

  public dropped(event: UploadEvent) {
    this.cdr.detectChanges();
    this.errorText = "";
    this.progress = 0;
    let files = event.files;
    if (files.length > 1) {
      alert('chon 1 file thoi');
    } else {
      for (const file of event.files) {
        const fileEntry = file.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: any) => {
          let type = this.service.getTypeFile(file);
          this.zone.run(() => {
            if (type == "xlsx" || type == "csv") {
              this.step = 2;
              this.addFile(file);
              this.startUpload();
            } else {
              this.errorText = "This file type is not supported.";
            }
          });
        });
      }
    }
  }
  openChooseFile(event: any) {
    console.log(this.currentTypeDrop)
    let file = event.target.files[0];
    let type = this.service.getTypeFile(file);
    if(this.currentTypeDrop == 1){
      this.currentFileName.three40bFile = file.name;
    }
    if (type == "xlsx" || type == "csv") {
      this.step = 2;
      this.addFile(file);      
      this.startUpload();
    } else {
      alert('This file type is not supported, please choose CSV file')
    }
  }
  addFile(file: any) {
    if (this.currentTypeDrop == 1) {
      this.three40bFile = file;
      this.currentFileName.three40bFile = file.name;
    } else {
      this.EMRFile = file;
      this.currentFileName.EMRFile = file.name;
    }
  }
  startUpload() {
    let action = interval(100).subscribe(x => {
      if (this.progress < 100) {
        this.progress += 10;
      }
      if (this.progress == 100) {
        this.step = 3;
        action.unsubscribe();
      }
    });
  }
  uploadSuccess() {
    this.progress = 100;
  }
  chooseFile() {
    $('#file340b').click();
  }
  upload() {
    this.common.toggleLoading(true);
    this.uploadERM = false;
    console.log("upload part-----", this.three40bFile);
    console.log("upload part-----", this.EMRFile);
    console.log("upload part-----", this.retail_net_increased_access_dollars);
    this.service.getContentFile(this.three40bFile, this.EMRFile, this.retail_net_increased_access_dollars).subscribe(
      data => {
        this.common.toggleLoading(false);
        if (data.Status == "success") {
          data.Data.currentFileName = this.currentFileName;
          this.dataUpload.emit({
            fields: data.Data
          });
          this.refreshFile();
        } else if (data.Status == 0) {
          $('#missingModal').modal('show');
        }
        else if (data.Status == 1) {
          this.error = data.Message;
          $('#modal-error').modal('show')
        }
      },
      (err: any) => {
        this.common.toggleLoading(false);
        alert('Server Error')
      },
      () => {

      })
  }
}
