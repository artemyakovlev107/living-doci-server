import { HttpMethod } from './../../services/http.method';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
@Component({
  selector: 'app-map-file',
  templateUrl: './map-file.component.html',
  styleUrls: ['./map-file.component.css']
})
export class MapFileComponent implements OnInit {
  mapForm: FormGroup;
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private fb: FormBuilder,
    private http_method: HttpMethod
  ) { }

  ngOnInit() {
    this.initForm();
    this.getBaseLine();
  }
  initForm(data?: any) {
    this.mapForm = this.fb.group({
      claim_type: [data?data.claim_type:''],
      rx_claim_sold_start: [data?data.rx_claim_sold_start:''],
      rx_claim_sold_end: [data?data.rx_claim_sold_end:''],
      number_rxs: [data?data.number_rxs:''],
      estimated_340b_cost: [data?data.estimated_340b_cost:''],
      plan_ar_amount: [data?data.plan_ar_amount:''],
      copay_amount: [data?data.copay_amount:''],
      saled_tax: [data?data.saled_tax:''],
      admin_fee: [data?data.admin_fee:''],
      dispense_fee: [data?data.dispense_fee:''],
      insured_admin_fee: [data?data.insured_admin_fee:''],
      client_fee: [data?data.client_fee:''],
      increased_access_dollars: [data?data.increased_access_dollars:''],
      total: [data?data.total:''],
      reconciliation_adjustment: [data?data.reconciliation_adjustment:''],
      retail_net_increase_access_dollar: [data?data.retail_net_increase_access_dollar:''],
      rx_reversals: [data?data.rx_reversals:'']
    })
  }
  onSubmit() {
    this.submit.emit(this.mapForm.value)
  }
  getBaseLine() {
    return this.http_method.callApi(this.http_method.baseUrl + "hcf/getbaseline").map((res: any) => res.json()).subscribe(
      (res: any) => {
        if (res.Data) {
          this.initForm(res.Data);
        }
      },
      (error: any) => {

      });
  }
}
