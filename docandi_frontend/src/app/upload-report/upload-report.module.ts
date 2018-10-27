import { MoneyPipe } from './../pipes/money.pipe';
import { DataTableModule } from 'angular2-datatable';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { MapDataComponent } from './components/map-data/map-data.component';
import { FileReviewComponent } from './components/file-review/file-review.component';
import { HistoryComponent } from './components/history/history.component';
import { UploadComponent } from './components/upload/upload.component';
import { Routes, RouterModule } from '@angular/router';
import { FileDropModule } from 'ngx-file-drop';
import { UploadServiceService } from './upload-service.service';
import { ReportComponent } from './report/report.component';
import { FinacialComponent } from './report/finacial/finacial.component';
import { ErmComponent } from './report/erm/erm.component';
import { MapComponent } from './report/map/map.component';
// import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import {NgDatepickerModule} from 'ng2-datepicker';
// import { LoadingModule } from 'ngx-loading';
import { SubmitHistoryComponent } from './submit-history/submit-history.component';
const routes: Routes = [
  {
    path: '', redirectTo: 'upload', pathMatch: 'full'
  }, {
    path: 'upload', component: UploadDataComponent
  }, {
    path: 'report', component: ReportComponent, children: [
      { path: '', redirectTo: 'finacial', pathMatch: 'full' },
      { path: 'finacial', component: FinacialComponent },
      { path: 'erm', component: ErmComponent },
      { path: 'map', component: MapComponent }
    ]
  },
  { path: 'history', component: SubmitHistoryComponent }];
@NgModule({
  imports: [
    CommonModule,
    FileDropModule,
    FormsModule,
    // NKDatetimeModule,
    NgDatepickerModule,
    DataTableModule,
    // LoadingModule,
    RouterModule.forChild(routes)
  ],
  declarations: [UploadDataComponent, MapDataComponent, FileReviewComponent, HistoryComponent, UploadComponent, ReportComponent, FinacialComponent, ErmComponent,
    MapComponent,
    MoneyPipe,
    SubmitHistoryComponent],
  providers: [UploadServiceService]
})
export class UploadReportModule { }
