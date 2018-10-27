import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from "./+login/login.component";

import { ThreeFortyBComponent } from "./+three-forty-b/340b.component";

import { ModuleWithProviders } from '@angular/core';

import { PageNotFoundComponent } from './+404/index';
import { HomePageComponent } from './+home/index';
import { AboutComponent } from './+about/index';
import { ForgotPasswordComponent } from './+forgot-password/index';
import { HealthCareSolutionsComponent } from './+healthcare-solutions/index';
import { ResetPasswordComponent } from './+reset-password/index';
import { SignUpComponent } from './+signup/index';
import { DashboardRoutes } from "./dashboard/dashboard.route"
import { SavingCardComponent } from "./+saving card/saving_card.component";
import { AnalysisRoutes } from "./analysis-tool/analysis.route";
import { About340BComponent } from "./+about340B/about340B.component";
import { SuperAdminRoutes } from "./super-admin/super-admin.route";
import { LoginAdminComponent } from "./super-admin/login/login-admin.component";
import { ProgressReportComponent } from "./dashboard/+progress-report/progress-report";
import { UploadGuard } from "./shared/services/upload.gaurd";

const appRoutes: Routes = [
    ...DashboardRoutes,
    ...AnalysisRoutes,
    ...SuperAdminRoutes,
    { path: 'login', component: LoginComponent, data: { title: 'Login' } },
    { path: '404', component: PageNotFoundComponent, data: { title: 'PageNotFound' } },
    { path: '', component: ThreeFortyBComponent, data: { title: '340B' } },
    { path: 'about', component: AboutComponent, data: { title: 'About' } },
    { path: 'forgot-password', component: ForgotPasswordComponent, data: { title: 'ForgotPassword' } },
    { path: 'healthcare-solutions', component: HealthCareSolutionsComponent, data: { title: 'HealthCareSolutions' } },
    { path: 'map', component: HealthCareSolutionsComponent, data: { title: 'map' } },
    { path: 'ResetPassword', component: ResetPasswordComponent, data: { title: 'ResetPassword' } },
    { path: 'sign-up', component: SignUpComponent, data: { title: 'SignUp' } },
    { path: '340b', component: ThreeFortyBComponent, data: { title: '340B' } },
    { path: 'waukegandiscountcard', component: SavingCardComponent, data: { title: 'Saving Card' } },
    { path: 'about340b', component: About340BComponent, data: { title: 'About 340B' } },
    { path: 'home', component: HomePageComponent, data: { title: 'HomePage' } },
    { path: 'upload-report', loadChildren: './upload-report/upload-report.module#UploadReportModule',canActivate:[UploadGuard] },
    { path: '**', component: HomePageComponent, data: { title: 'HomePage' } },

];


export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
