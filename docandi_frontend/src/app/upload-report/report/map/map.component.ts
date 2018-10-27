import { Http } from '@angular/http';
import { UploadServiceService } from './../../upload-service.service';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
declare var google: any;
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor(private service: UploadServiceService, private http: Http) { }
  fromDate: any = new Date('2017-1-1');
  // toDate: any = new Date();
  range_date: any = 12;
  pointArray = new google.maps.MVCArray([]);
  bounds = new google.maps.LatLngBounds();
  map: any;
  listPharmacy: any;
  listPharmacyDisplay: any = [];
  hideFilter: any = true;
  heatPoint: any = [];
  infoWindows: any = [];
  fillterOption = [
    {
      name: "All",
      value: 'all'
    },
    {
      name: "Non-Contracted",
      value: "nonContracted"
    }, {
      name: "Contracted",
      value: "contracted"
    }, {
      name: "Specific Pharmacies",
      value: "specific"
    }
  ]
  optionFilter: any = "all";
  ngOnInit() {
    this.initMap();
    this.getMapData(this.fromDate, this.range_date);
  }
  initMap(heatData?: any) {
    var sanFrancisco = new google.maps.LatLng(37.774546, -122.433523);
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 1,
      center: sanFrancisco
    });
    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatData ? heatData : this.pointArray,
      map: this.map,
      radius: 100
    });
    if (heatData) {
      if (heatData.length > 1) {
        this.map.fitBounds(this.bounds);
      }
    }
  }
  changeDate() {
    this.getMapData(this.fromDate, this.range_date)
  }
  getMapData(from: any, range_date: any) {
    from = moment(from).format('YYYY-MM-DD');
    this.service.getMapData(from, range_date).subscribe((data: any) => {
      if (data.Status == 'success') {
        let results = data.Data;
        this.listPharmacy = results;
        this.setPoint(results);
        this.handlePharmacies();
      } else {
        alert(data.Message)
      }
    })
  }
  setPoint(results: any) {
    let heatPoint = [];
    for (let i = 0; i < results.length; i++) {
      let point = new google.maps.LatLng(results[i].latitude, results[i].longitude);
      heatPoint.push(point);
      this.bounds.extend(point);
    }
    this.initMap(heatPoint);
    setTimeout(() => {
      for (let i = 0; i < results.length; i++) {
        this.createMarker(results[i], results[i].latitude, results[i].longitude);
      }
    }, 1000);
  }
  clearFilters() {
    this.handlePharmacies();
  }
  filter() {
    this.hideFilter = true;
    let heatmapData = [];
    for (let i = 0; i < this.listPharmacy.length; i++) {
      if (this.listPharmacy[i].checked) {
        heatmapData.push(this.listPharmacy[i]);
      }
    }
    this.setPoint(heatmapData);
  }
  handlePharmacies() {
    switch (this.optionFilter) {
      case 'all':
        this.listPharmacy.map((item: any) => {
          item.checked = true;
        })
        break;
      case 'nonContracted':
        this.listPharmacy.map((item: any) => {
          if (item.contracted == 0) {
            item.checked = true;
          } else {
            item.checked = false;
          }
        })
        break;
      case 'contracted':
        this.listPharmacy.map((item: any) => {
          if (item.contracted == 1) {
            item.checked = true;
          } else {
            item.checked = false;
          }
        })
        break;
      case 'specific':
        this.listPharmacy.map((item: any) => {
          item.checked = false;
        })
        break;
    }
  }
  createMarker(pharmacy: any, lat: any, lng: any) {
    console.log(pharmacy)
    let content = ` <div class="walgreen">
    <div class="walgreen-content">
      <div class="walgreen-left">
        <img src="${pharmacy.logo}">
        <div class="text-footer" style="background:#ff514a;color:white;font-weight: bold;text-align: center;">${pharmacy.contracted?'Contracted':'Non-Contracted'}</div>
      </div>
      <div class="walgreen-right">
        <div class="walgreen-right-content">
          <h4 class="walgreen-title">${pharmacy.pharmacy_name}</h4>
          <div class="walgreen-text">
            <p>${pharmacy.address}</p>
            <p>${pharmacy.city},${pharmacy.state} ${pharmacy.zip}</p>
            <br/>
            <p><strong>${pharmacy.rx_count} total Rx</strong></p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
    let marker = new google.maps.Marker({
      map: this.map,
      icon: {
        labelOrigin: new google.maps.Point(13, -8),
        url: pharmacy.contracted?'assets/images/doc_and_i_icon_sm.png':'assets/images/icons8-plus-50.png' 
      },
      position: {
        lat: Number(lat),
        lng: Number(lng)
      }
    });
    let infowindowOption = {
      content: content
    };
    let infowindow = new google.maps.InfoWindow(infowindowOption);
    this.infoWindows.push(infowindow);
    marker.addListener('click', (data: any) => {
      this.closeInfowindow();
      infowindow.open(this.map, marker);
    });
  }
  closeInfowindow() {
    for (let i = 0; i < this.infoWindows.length; i++) {
      this.infoWindows[i].close();
    }
  }
}
