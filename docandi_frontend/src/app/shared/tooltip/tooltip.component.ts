import { Title } from '@angular/platform-browser/src/browser/title';
import { element } from 'protractor';
import { HandleTooltipService, Tooltip } from './../services/handleTooltip.service';
import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css']
})
export class TooltipComponent {
 
  title: string;
  content: string;
  step: number;
  page: string;
  position: string;
  showTour: boolean;
  bound:boolean;
  activePage:number;
  pageView:string;
  maxSize:number;
  disableEndtour:boolean = false;
  constructor(private _tooltip: HandleTooltipService, private zone: NgZone, private _router: Router) {
    this._tooltip.exportTooltip.subscribe(data => {
     
      this.handleTooltip(data);
      this.showTour = data.showTour;
      if (this.showTour  && localStorage.getItem('currentUser') && data.showTour) {
        if (data.url == '/map') {
          this._router.navigate(['/340b', { map: true }]);
        } else
          if (data.url == "/card") {
            this._router.navigate(['/340b']);
          }
          else
            if (data.url == '/dashboard/home/my-achievements') {
              
              this._router.navigate(['/dashboard/home/my-achievements']);
              setTimeout(() => {
                this._router.navigate(['/dashboard/home/my-achievements']);
              }, 500);
            }
            else {
              this._router.navigate([data.url]);
            }
      }
    })
  }
  handleTooltip(tooltip: any) {
    console.log(tooltip)
    let current = tooltip.data[tooltip.active];
    this.title = current.title;
    this.content = current.content;
    this.position = `tooltip-aleart ${current.position}`;
    this.bound = tooltip.bound;
    this.activePage = tooltip.active;
    this.pageView = tooltip.page;
    this.maxSize = tooltip.data.length-1;
    
    if(tooltip.page=='card'&& this.activePage == 2 && localStorage.getItem('completed_tutorial')=='1'){
      this.disableEndtour = true
    }
  }
  next() {   
    if( this.pageView == "card" && this.activePage==2){
      this._tooltip.openEndTour();
    }else{
      console.log('next')
      this._tooltip.next();
    }
  }
  prev() {
    this._tooltip.prev();
  }
  endTour(){
    if(localStorage.getItem('completed_tutorial')=='1'){
      this._tooltip.hideTour();
    }else{
      this._tooltip.openEndTour();
    
    }
    
  }
}
