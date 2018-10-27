import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SuperAdminComponent} from "./super-admin.component";
import {LoginAdminComponent} from "./login/login-admin.component";
import {HospitalComponent} from "./hospital/hospital.component";
import {ManagerHospitalComponent} from "./manager-hospital/manager-hospital.component";
import {AdminMenuLeftComponent} from "./manager-hospital/menu-left/admin-menu-left.component";
import {AdminPharmacyComponent} from "./manager-hospital/manager-pharmacy/admin-pharmacy.component";
import {AdminClinicComponent} from "./manager-hospital/manager-clinic/admin-clinic.component";
import {AdminMemberComponent} from "./manager-hospital/manager-member/admin-member.component";
import {FAQComponent} from "./faq/faq.component";
export const SuperAdminRoutes: Routes = [
	{
		path: 'admin',
		component: SuperAdminComponent,
		children: [
			{
				path:'',redirectTo:'login',pathMatch:'full'
			},
			{
				path: 'manager',
				component: ManagerHospitalComponent,
				children: [
					{path: 'clinic/:id', component:AdminClinicComponent},
					{path: 'pharmacy/:id', component: AdminPharmacyComponent},
					{path: 'member/:id', component: AdminMemberComponent},
				]
			},
			{
				path: 'login',
				component: LoginAdminComponent
			},
			{
				path: 'hospital',
				component: HospitalComponent
			},
			{
				path: 'faq',
				component: FAQComponent
			}
			// {
			// 	path: 'my-pharmacies',
			// 	component: MyPharmaciesComponent
			// }
       ]
	},
];