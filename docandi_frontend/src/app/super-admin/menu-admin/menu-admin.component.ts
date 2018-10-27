import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.css']
})
export class MenuAdminComponent implements OnInit {
  @Input() page:string;
  constructor() { }

  ngOnInit() {
  }

}
