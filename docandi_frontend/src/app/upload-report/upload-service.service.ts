import { HttpMethod } from './../shared/services/http.method';
import { Injectable } from '@angular/core';
import { Http, HttpModule, Headers, RequestOptions, JsonpModule } from '@angular/http';
@Injectable()
export class UploadServiceService {
  baseUrl: string;
  constructor(private http: Http, private http_method: HttpMethod) {
    this.baseUrl = this.http_method.baseUrl;
  }
  public getTypeFile(file: any) {
    let name = file.name;
    let type = name.split('.').pop();
    return type;
  }
  public getContentFile(financial: any, emr: any, retail_net_increased_access_dollars: any) {
    let user: any;
    if (localStorage.getItem('user')) {
      user = JSON.parse(localStorage.getItem('user'))
      console.log("user", user)
    }
    let options = new RequestOptions({ withCredentials: true });
    let formData: FormData = new FormData();
    console.log(emr)
    if (emr) {
      console.log("setting emr")
      formData.append('emr', emr, emr.name);
      console.log(emr.name)
      console.log(formData)
    } else {
      formData.append('financial', financial, financial.name);
    }

    if (retail_net_increased_access_dollars) {
      formData.append('retail_net_increased_access_dollars', retail_net_increased_access_dollars);
    }

    formData.append('hcf_id', user.health_care_facility_id);
    console.log("formData", formData);
    console.log("options", options);
    console.log(this.baseUrl);
    return this.http.post(this.baseUrl + "report/upload", formData, options).map(res => res.json());
  }
  public getHistory() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ withCredentials: true });
    let token = this.getLogintoken();
    let url = this.baseUrl + "hcf/uploadhistory?loginToken=" + token;
    return this.http.get(url, options).map(res => res.json());
  }
  getLogintoken() {
    if (JSON.parse(localStorage.getItem('currentUser'))) {
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      return currentUser.login_token;
    }
    else {
      return null;
    }

  }
  getPrescriberdata(from: any, date_range: any) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ withCredentials: true });
    let token = this.getLogintoken();
    let url = this.baseUrl + `report/prescriberdata?from_date=${from}&date_range=${date_range}`;
    return this.http.get(url, options).map(res => res.json());
  }
  getErmData(from: any, to: any) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ withCredentials: true });
    let token = this.getLogintoken();
    let url = this.baseUrl + `report/emrdata?from_date=${from}&date_range=${to}`;
    return this.http.get(url, options).map(res => res.json());
  }
  getMapData(from: any, to: any) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ withCredentials: true });
    let token = this.getLogintoken();
    let url = this.baseUrl + `report/heatmap?from_date=${from}&date_range=${to}`;
    return this.http.get(url, options).map(res => res.json());
  }
  public getSubmitHistory() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ withCredentials: true });
    let token = this.getLogintoken();
    let url = this.baseUrl + "report/uploadhistory?loginToken=" + token;
    return this.http.get(url, options).map(res => res.json());
  }
  public deleteHistory(date: any) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ withCredentials: true });
    let token = this.getLogintoken();
    let url = this.baseUrl + "report/deletemonthly?timeframe=" + date + "&loginToken=" + token;
    return this.http.get(url, options).map(res => res.json());
  }
  public uploadspecific(file: any, type: any, time_frame: any, is_base_line: any) {
    let user: any;
    if (localStorage.getItem('user')) {
      user = JSON.parse(localStorage.getItem('user'))
    }
    let options = new RequestOptions({ withCredentials: true });
    let formData: FormData = new FormData();
    formData.append('type', type);
    formData.append('file', file, file.name);
    formData.append('time_frame', time_frame);
    formData.append('is_base_line', is_base_line);
    return this.http.post(this.baseUrl + "repport/uploadspecific", formData, options).map(res => res.json());
  }
  public deletespecific(time: any, type: any, baseline: any) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ withCredentials: true });
    let token = this.getLogintoken();
    let url = this.baseUrl + "report/deletespecific";
    let request = { time_frame: time, type: type, is_base_line: baseline }
    return this.http.post(url, request, options).map(res => res.json());
  }
}
