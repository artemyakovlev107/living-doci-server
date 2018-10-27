import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Title } from '@angular/platform-browser/src/browser/title';


export class Tooltip {
    page: string;
    active: number;
    url: string;
    showTour:boolean;
    bound:boolean;
    data: Array<{
        step: number,
        content: string,
        title: string,
        position: string
    }>
}
const ListTooltip: Array<Tooltip> = [
    {
        page: 'overview',
        active: 0,
        url: '/dashboard/home/overview',
        showTour:false,
        bound:false,
        data: [
            {
                step: 0,
                content: "This is your Dashboard Performance Page",
                title: "Welcome to Your Dashboard",
                position: ""
            },
            {
                step: 1,
                content: "Here you can see how many points you have. You collect points every-time you use the software",
                title: "Points",
                position: ""
            },
            {
                step: 2,
                content: "These points convert into tokens. See how many tokens you have earned here",
                title: "Tokens",
                position: ""
            },
            {
                step: 3,
                content: "Here you can see how many patients you have helped",
                title: "Patients",
                position: "",
            },
            {
                step: 4,
                content: "Here you can see the average amount of savings patients have received. Did you know that the average patient saves 25-50% and just over $62 dollars per prescription when they use a partner pharmacy. Those savings add up quick!",
                title: "Making a Difference",
                position: "tooltip-left"
            },
            {
                step: 5,
                content: "Down here you can see how you are performing compared to your peers. This highlights the top users of the software. Your management will also be able to see the top users to recognize top achievers",
                title: "Leaderboard",
                position: "tooltip-top"
            },
        ]
    },
    {
        page: 'my-achievements',
        showTour:true,
        active: 0,
        url: '/dashboard/home/my-achievements',
        bound:false,
        data: [
            {
                step: 0,
                content: "This is the place to see how many patients you’ve captured and your performance metrics so far!",
                title: "My Achievements",
                position: "tooltip-top"
            },
            {
                step: 1,
                content: "Here you can see your monthly points, lifetime points and # of patients you have helped.",
                title: "Metrics",
                position: ""
            },
            {
                step: 2,
                content: "This is your personal token bank and store. Click here to use your tokens to purchase items such as new avatars and backgrounds",
                title: "Award Shop",
                position: ""
            },
            {
                step: 3,
                content: "Once you purchase a new Avatar or background click here to view your purchases and select one",
                title: "Backgrounds and Avatars",
                position: "tooltip-left"
            }
        ]
    },
    {
        page: '340b',
        showTour:true,
        active: 0,
        url: '/340b',
        bound:false,
        data: [
            {
                step: 0,
                content: "Great, now you are ready to see your first patient and start helping your patients",
                title: "Capture Patients",
                position: ""
            },
            {
                step: 1,
                content: "The first step is to look in the EMR and see what pharmacy your patient is using. This might be called their preferred pharmacy",
                title: "EMR Pharmacy Look Up",
                position: "tooltip-top"
            },
            {
                step: 2,
                content: "Now that you know their pharmacy you can quickly see if the patient is using a contracted pharmacy. Either click here for a drop down list, enter a zip-code, or search by city",
                title: "Is It  Contracted?",
                position: "tooltip-top"
            },
            {
                step: 3,
                content: "Great the patient is already using a contract pharmacy. Choose the pharmacy they are using and select YES",
                title: "Yes, A Contracted Pharmacy!",
                position: ""
            },
            {
                step: 4,
                content: "Thank the patient and let them know the benefits of using a 340B Partner pharmacy",
                title: "Thanks the Patient",
                position: ""
            },
            {
                step: 5,
                content: "It is that easy. You are ready for your next patient",
                title: "Click Submit",
                position: "tooltip-top"
            },
            {
                step: 6,
                content: "The patient is NOT using a contract pharmacy.  GREAT- This means there is an opportunity for you help your patient save money on their medications.",
                title: "Patient 2, Don’t See the Pharmacy?",
                position: "tooltip-left"
            }
            ,
            {
                step: 7,
                content: "After you confirmed they are not using a contract pharmacy click NO",
                title: "Not, a Contracted Pharmacy",
                position: ""
            }
            ,
            {
                step: 8,
                content: "Let the patient know the benefits of the 340B pharmacies",
                title: "Talk about 340B",
                position: ""
            }
            ,
            {
                step: 9,
                content: "Now you can help the patient find a convenient pharmacy. Check this box and select <strong>see map</strong>",
                title: "Look at Contracted Pharmacies Locations",
                position: "tooltip-top"
            }
        ]
    },
    {
        page: 'map',
        showTour:true,
        active: 0,
        url: '/map',
        bound:false,
        data: [
            {
                step: 0,
                content: "Your clinic location will automatically populate on the map or you can click up here to search by a different address or zipcode",
                title: "Search to Find New Areas",
                position: ""
            },
            {
                step: 1,
                content: "Here you can scroll down to see all contracted pharmacies",
                title: "Contracted Pharmacies",
                position: "tooltip-top"
            },
            {
                step: 2,
                content: "Here you can search by features that might be important to your patients such as 24 hour pharmacies, drive thru, delivery or look at our recommended choices",
                title: "Pharmacy Features",
                position: ""
            },
            {
                step: 3,
                content: "Once you find a good option select it here and click agreed to switch. Then you will be back to the script. You can always go back and forth between the map and script",
                title: "Find A Good Fit",
                position: "tooltip-top-left"
            }
        ]
    },
    {
        page: 'back-to-script',
        showTour:true,
        active: 0,
        url: '/340b',
        bound:false,
        data: [
            {
                step: 0,
                content: "Select a reason from the drop down or fill in a reason",
                title: "IF they Don’t Agree to Change",
                position: ""
            },
            {
                step: 1,
                content: "Now that you helped your patient find a new pharmacy it is time to update that preferred pharmacy in the EMR. This step is very important",
                title: "Agreed? Update Their Preferred Pharmacy",
                position: "tooltip-left"
            },
            {
                step: 2,
                content: "Make sure the patient has the handout and highlight their new pharmacy. Don’t forget you are required and must tell every patient that they have the freedom to use any pharmacy of their choosing. GREAT JOB!",
                title: "Talk About Freedom of Choice",
                position: "tooltip-left"
            }
        ]
    },
    {
        page: 'card',
        showTour:true,
        url: '/card',
        active: 0,
        bound:false,
        data: [
            {
                step: 0,
                content: "If the patient doesn’t have insurance you can send them the discount card to help ensure the pharmacist gives them the discount. The patient has the option to receive this card by text or email",
                title: "For the Uninsured",
                position: "tooltip-left"
            },
            {
                step: 1,
                content: "Enter the patient's name and this will populate on the card. They can also receive the location of their new pharmacy",
                title: "Enter Name",
                position: ""
            },
            {
                step: 2,
                content: "Be sure the patient has verbally agreed to receiving an email or text and click here",
                title: "Get Approval",
                position: ""
            }
        ]
    }];

@Injectable()
export class HandleTooltipService {
    indexTooltip: number = 0;
    public currentTooltip: Tooltip = ListTooltip[this.indexTooltip];
    public exportTooltip = new BehaviorSubject<Tooltip>(this.currentTooltip);
    public endTourModal = new BehaviorSubject<boolean>(false);
    currentStep: number = 0;
    constructor() {

      if(localStorage.getItem('completed_tutorial') == '1'){
        this.hideTour();
      }else{
        //   this.showTour();
      }
    }
    changePage(index: any) {
        this.indexTooltip = index;
        this.exportTooltip.next(ListTooltip[index]);
    }
    changeTooltip(page: any, stepview: any) {
    }
    next() {
        
        let stepQuantity = this.currentTooltip.data.length;
        if (this.currentStep < stepQuantity - 1) {
            this.currentTooltip.active++;
            this.currentStep++;
            this.update();
        } else {
            if (this.indexTooltip != 5) {
                debugger
                this.indexTooltip++;
                this.currentTooltip = ListTooltip[this.indexTooltip];
                this.currentStep = 0;
                this.update();
            }
        }
    }
    prev() {
        if (this.currentStep != 0) {
            this.currentTooltip.active--;
            this.currentStep--;
            this.update();
        } else {
            if (this.indexTooltip != 0) {
                this.indexTooltip--;
                this.currentTooltip = ListTooltip[this.indexTooltip];
                this.currentTooltip.active = this.currentTooltip.data.length - 1;
                this.currentStep = this.currentTooltip.active;
                this.update();
            }
        }
    }
    update() {
        this.exportTooltip.next(this.currentTooltip);
    }
    hideTour(){
        this.currentTooltip.showTour = false;
        this.update();       
    }
    showTour(){
        this.currentTooltip.showTour = true;
        this.update();   
    }
    tourStart(){
        this.currentTooltip.showTour = true;
        this.update(); 
    }
    openEndTour(){        
        this.endTourModal.next(true);
        this.hideTour();
        
    }
    closeEndTour(){
        this.endTourModal.next(false);
    }
    tourAgain(step:number){
        this.currentStep = 0;
        if(step == 6){
            this.indexTooltip = 0;
            this.currentTooltip = ListTooltip[this.indexTooltip];
            this.currentTooltip.active = 0;
            this.currentTooltip.bound = false;
            this.currentTooltip.showTour = true;
        }else{
            this.indexTooltip = step;
            this.currentTooltip = ListTooltip[this.indexTooltip];
            this.currentTooltip.active = 0;
            this.currentTooltip.bound = true;
            this.currentTooltip.showTour = true;
        }

       
        this.update();
    }
    resetTooltip(){
        this.indexTooltip = 0;
        this.currentTooltip = ListTooltip[this.indexTooltip];
        this.currentTooltip.active = 0;
        this.currentTooltip.showTour = false;
        this.update();
    }
}
