import {HttpMethod} from "../shared/services/http.method";
declare var $ : any;
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from "rxjs";
import {TranslateService} from 'ng2-translate';
@Component({
	moduleId: module.id,
	selector: 'saving_card',
	templateUrl: 'saving_card.component.html',
	providers: [TranslateService]
})

export class SavingCardComponent {
	http_method:any;
	baseUrl:string;
	cardUrl_front:string;
	cardUrl_backside:string;
	email:string;
	errMess:string;
	sending:boolean=false;
	links:Array<string>;
	language:string;
	error:boolean = false;
	constructor(private router:Router, public translate: TranslateService,http_method: HttpMethod) {
		this.http_method = http_method;
		this.baseUrl = this.http_method.baseUrl;
		translate.addLangs(["English","Spanish"]);
		translate.setDefaultLang('English');
		let browserLang = translate.getBrowserLang();
		translate.use(browserLang.match(/English|Spanish/) ? browserLang : 'English');
		this.cardUrl_front=this.baseUrl+ "assets/images/saving_card_modified/frontside_savingcard_english.png";
		this.cardUrl_backside= this.baseUrl+"assets/images/saving_card_modified/backside_savingcard_english.png";
		this.links = [this.cardUrl_front,this.cardUrl_backside];
		this.hideTop();
	}
	changeLanguage(language:any){
		if(language ==  'English'){
			this.cardUrl_front=this.baseUrl+ "assets/images/saving_card_modified/frontside_savingcard_english.png";
			this.cardUrl_backside= this.baseUrl+"assets/images/saving_card_modified/backside_savingcard_english.png";
			this.links = [this.cardUrl_front,this.cardUrl_backside];
			this.language = 'english';
		}
		else {
			this.cardUrl_front=this.baseUrl+ "assets/images/saving_card_modified/frontside_savingcard_spanish.png";
			this.cardUrl_backside= this.baseUrl+"assets/images/saving_card_modified/backside_savingcard_spanish.png";
			this.links = [this.cardUrl_front,this.cardUrl_backside];
			this.language = 'spanish';
		}
	}
	print(){
		var divContents = document.getElementById("printTag").innerHTML;
		var printWindow = window.open('', '', 'height=800,width=1200');
		printWindow.document.write('<html><head><title>Saving card</title>');
		printWindow.document.write('</head><body >');
		printWindow.document.write(divContents);
		printWindow.document.write('</body></html>');
		printWindow.document.close();
		printWindow.print();
	}
	changeLang(){
		this.translate.use('esp');
	}
	emailPopup(){
		$('#emailModal').modal('show');
	}
	sendEmail(){
		this.sending = true;
		this.error = false;
		return this.http_method.postApiNotAuth(this.baseUrl+"user/emailcart",{email:this.email,language:this.language}).subscribe(
			(res:any) => {
				this.sending = false;
				let Res = JSON.parse(res._body);
				if(Res.Status == "success"){
					$('#emailModal').modal('hide');
				}
				else {
					this.errMess = Res.Message;
					setTimeout(() => {
						this.errMess= null;
					}, 2000);
				}
			},
			(error:any) => {
					this.error = true;
					this.sending = false;
			});
	}
	hideTop(){
		$('.topnav-navbar').hide();
		$('.main-container').css({'padding-top':0});
	}
	download(){
		let link = document.createElement('a');

		link.setAttribute('download', null);
		link.style.display = 'none';

		document.body.appendChild(link);

		for (let i = 0; i < this.links.length; i++) {
			link.setAttribute('href', this.links[i]);
			link.click();
		}

		document.body.removeChild(link);
	}
}
