import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  constructor(private router: Router) {
    router.events.subscribe((val: any) => {
      let arr = val.url.split('/');
      this.currentPage = arr[arr.length-1];
      console.log(this.currentPage)
    });
  }
  currentPage: any;
  ngOnInit() {

  }
  goto(page: any) {
    this.currentPage = page;
    this.router.navigate(['/upload-report/report', page]);
  }
}
