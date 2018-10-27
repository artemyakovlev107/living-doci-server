import { MapFileComponent } from './shared/components/map-file/map-file.component';

import { HandleTooltipService } from './shared/services/handleTooltip.service';
import { CommonDataService } from './shared/services/common-data.service';
import { AuthGuard } from './shared/services/auth.gaurd';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Http} from '@angular/http';
import { Headers, RequestOptions, JsonpModule, URLSearchParams } from '@angular/http';
import { DataTableModule } from "angular2-datatable";
import { AppComponent } from './app.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from "./+login/login.component";

import { DashboardComponent } from './dashboard/dashboard.component';

import { HomeOverviewComponent } from './dashboard/+home/+home-overview/home-overview.component';
import { MyAchievementsComponent } from './dashboard/+home/+my-achievements/my-achievements';
import { HomeComponent } from './dashboard/+home/index';
import { AccountSettingsComponent } from './dashboard/+setting/account-settings.component';

import { SignUpComponent } from './+signup/index';

import { HomeMenuLeftComponent } from './dashboard/+home/+menu-left/menu-left';

import { HelpComponent } from './dashboard/+help/index';
import { MyClinicComponent } from './dashboard/+my-clinic/index';
import { MyPharmaciesComponent } from './dashboard/+my-pharmacies/index';

//Home Page
import { HomePageComponent } from './+home/index';
import { PageNotFoundComponent } from './+404/index';
import { AboutComponent } from './+about/index';
// import { DrugResultsComponent} from './+drug-results/index';
// import { DrugSearchComponent} from './+drug-search/index';
import { ForgotPasswordComponent } from './+forgot-password/index';
import { HealthCareSolutionsComponent } from './+healthcare-solutions/index';
import { ResetPasswordComponent } from './+reset-password/index';

import { routing, appRoutingProviders } from './app.routing';

import { FormsModule } from "@angular/forms";
//import {OrderBy} from "./shared/pipes/orderBy";
//google map module
// import { AgmCoreModule } from 'angular2-google-maps/core';
import { AgmCoreModule } from '@agm/core';

// Import new module at here...
import { ChartsModule } from "ng2-charts";
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { UserDataService } from "./shared/services/userdata.services";
import { RouterModule } from '@angular/router';

import { ThreeFortyBComponent } from "./+three-forty-b/340b.component";
import { HttpMethod } from "./shared/services/http.method";
import { SharedModule } from "./shared/shared.module";
import { SidebarComponent } from "./shared/sidebar/sidebar";
import { SavingCardComponent } from "./+saving card/saving_card.component";

import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate';
import { AnalysisComponent } from "./analysis-tool/analysis.component";
import { AnalysisMenuComponent } from "./analysis-tool/menu-left/analysis-menu.component";
import { MAPerformanceComponent } from "./analysis-tool/MA-performance/MA-performance.component";
// import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import {NgDatepickerModule} from 'ng2-datepicker';
import { Three40BMetricComponent } from "./analysis-tool/+340BMetric/340BMetric.component";
import { CKEditorModule } from 'ng2-ckeditor';
import { SoftwareUsageComponent } from "./analysis-tool/Software-Usage/Software-Usage.component";
import { About340BComponent } from "./+about340B/about340B.component";
import { SuperAdminComponent } from "./super-admin/super-admin.component";
import { LoginAdminComponent } from "./super-admin/login/login-admin.component";
import { HospitalComponent } from "./super-admin/hospital/hospital.component";
import { ManagerHospitalComponent } from "./super-admin/manager-hospital/manager-hospital.component";
import { AdminMenuLeftComponent } from "./super-admin/manager-hospital/menu-left/admin-menu-left.component";
import { AdminPharmacyComponent } from "./super-admin/manager-hospital/manager-pharmacy/admin-pharmacy.component";
import { AdminClinicComponent } from "./super-admin/manager-hospital/manager-clinic/admin-clinic.component";
import { AdminMemberComponent } from "./super-admin/manager-hospital/manager-member/admin-member.component";
import { ProgressReportComponent } from "./dashboard/+progress-report/progress-report";
import { LoadingModule } from 'ngx-loading';
import { LOCALE_ID } from '@angular/core';
import { FAQComponent } from "./super-admin/faq/faq.component";
import { MenuAdminComponent } from './super-admin/menu-admin/menu-admin.component';
import { FileDropModule } from 'ngx-file-drop';
import { UploadReportModule } from './upload-report/upload-report.module';
import { UploadGuard } from './shared/services/upload.gaurd';
import { MoneyPipe } from './pipes/money.pipe';

import {NgxPaginationModule} from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
//-----
import { WidgetChartsModule } from './charts/widget-charts.module';

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    routing,
    RouterModule,
    HttpClientModule,
    LoadingModule,
    JsonpModule,
    DataTableModule,
    ChartsModule,
    Ng2AutoCompleteModule,
    // NKDatetimeModule,
    NgDatepickerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgbModule,
    //---------
    WidgetChartsModule,

    CKEditorModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDpMC6sbIMGk3ffgCcRmjVeNuGc2Sr1X_c'
    }),
    SharedModule,
    FileDropModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [HttpClient]
    })
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    ThreeFortyBComponent,
    HomeMenuLeftComponent,
    DashboardComponent,
    HomeComponent,
    HomeOverviewComponent,
    MyAchievementsComponent,
    AccountSettingsComponent,
    ProgressReportComponent,
    SavingCardComponent,
    // TopNavComponent,
    SidebarComponent,
    HelpComponent,
    MyClinicComponent,
    MyPharmaciesComponent,

    //Home Page
    PageNotFoundComponent,
    HomePageComponent,
    AboutComponent,
    // DrugResultsComponent,
    // DrugSearchComponent,
    ForgotPasswordComponent,
    HealthCareSolutionsComponent,

    ResetPasswordComponent,
    SignUpComponent,
    AnalysisComponent,
    AnalysisMenuComponent,
    MAPerformanceComponent,
    Three40BMetricComponent,
    SoftwareUsageComponent,
    About340BComponent,
    // adminpage
    SuperAdminComponent,
    LoginAdminComponent,
    HospitalComponent,
    ManagerHospitalComponent,
    AdminMenuLeftComponent,
    AdminPharmacyComponent,
    AdminClinicComponent,
    AdminMemberComponent,
    FAQComponent,
    MenuAdminComponent

  ],
  providers: [
    { provide: LOCALE_ID, useValue: "en-US",
   },
    UserDataService,
    HttpMethod,
    AuthGuard,
    CommonDataService,
    HandleTooltipService,
    UploadGuard
  ],
  bootstrap: [AppComponent]
    

})


export class AppModule { }
