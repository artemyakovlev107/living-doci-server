import {HttpMethod} from "../shared/services/http.method";
declare var $ : any;
import { Component } from '@angular/core';

/**
 * This class represents the lazy loaded LoginComponent.
 */

@Component({
  moduleId: module.id,

  selector: 'home-cmp',
  templateUrl: 'home.component.html',
//   styleUrls: ['../../assets/css/app.css'],
})
export class HomePageComponent {
  http_method:any;
  baseUrl:any;
    videoUrl:string;
    request:{
      name:string,
      email:string,
        message:any
    };
    name:string;
    email:string;
    message:any;
    errorMessage:any;
    success:boolean;
    status:string;
    sending:boolean;
  constructor(http_method: HttpMethod){
    this.http_method = http_method;
    this.baseUrl = this.http_method.baseUrl;
    this.getVideo();
  }
  openvideo(){
     $("#media-video").get(0).play();
  }
    SendRequest() {
        this.request={
            name:this.name,
            email:this.email,
            message:this.message
        }
        this.sending = true;
        return this.http_method.postApiNotAuth(this.baseUrl+"signupmail",this.request).subscribe(
            (res:any) => {
                let Res = JSON.parse(res._body);
                if(Res.Status =='success') {
                    this.name = null;
                    this.email = null;
                    this.message = null;
                    this.success = true;
                    this.status = "Send request success!"
                    this.sending= false;
                } else {
                    this.status = "Send request fail, try again!"
                   this.success = false;
                    this.sending= false;
                }
                setTimeout(() => {
                    this.status = null;
                    this.sending= false;
                }, 2000);

            },
            (error:any) => {
                this.status = "Send request fail, try again!"
                setTimeout(() => {
                    this.status = null;
                    this.sending= false;
                }, 2000);
            });
    }
  getVideo(){
    return this.http_method.callApiNotAuth(this.baseUrl+"overviewvideo").subscribe(
        (res:any) => {
          let Res = JSON.parse(res._body);
          this.videoUrl = Res.Data;
          var myVideo = document.getElementsByTagName('video')[0];
          myVideo.load();
        },
        (error:any) => {
               
        });
  }
    closeVideo(){
        $("#media-video").get(0).pause();
    }
}
