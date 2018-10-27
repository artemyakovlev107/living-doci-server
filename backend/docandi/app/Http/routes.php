<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/


/*Route::options('{all}', function () {
    $response = Response::make('');
    $response->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');
    $response->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    $response->header('Access-Control-Allow-Credentials', 'true');
    $response->header('X-Content-Type-Options', 'nosniff');

    return $response;
});*/

Route::get('/', function () {
    return view('welcome');
});

Route::group(['middleware' => ['session']], function () {
//User
	Route::get('/users/getuserdetails','UserController@GetUserDetails');

	Route::get('/user/logout','UserController@Logout');

	Route::post('/user/changePassword', 'UserController@ChangePassword');

	Route::get('/user/changeavatar','UserController@ChangeAvatar');

	Route::get('/user/changebackground','UserController@ChangeBackground');

	Route::post('/patientCapture/CreatePatientCapture', 'PatientCaptureController@CreatePatientCapture');

	Route::post('/user/switchuser','UserController@SwitchUser');

	Route::post('user/sendsms','UserController@SendSms');

	Route::get('user/savingcart','UserController@SavingCard');

	Route::post('user/discountcard','UserController@EmailDiscountCard');

	Route::get('user/lastusingtime','UserController@SetLastUsingTime');

    Route::get('user/weeklyreport','UserController@UserWeeklyReport');

// Healthcare facilities

	Route::get('/health_care_facilities/gethcfdetails','HcfController@GetHcfDetails');

	Route::get('/health_care_facilities/getlisthcflocations','HcfController@GetListHcfLocation');

//Reward

	Route::get('/reward/listcategorypointshop', 'RewardController@GetListRewardCategory');

	Route::get('/user/listavatar','RewardController@GetListAvatar');

	Route::get('/reward/listavatar','RewardController@GetListAvatarByCategoryId');

	Route::get('/reward/allavatar', 'RewardController@GetAllAvatar');
	
	Route::get('/reward/exchangereward','RewardController@ExchangeReward');

	Route::get('/reward/getallbackground','RewardController@GetAllBackground');

	Route::get('/reward/getlistuserbackground','RewardController@GetListUserBackground');

// Pharmacy

	Route::get('/contracted_pharmacies/list','PharmacyController@GetListPharmacyByHcfId');

	Route::get('/pharmacy/getlistpharmacynearbyhcflocation','PharmacyController@GetListPharmacyNearbyHcfLocation');

	Route::get('pharmacy/getallpharmacy','PharmacyController@GetAllPharmacy');

	Route::get('pharmacy/getlistpharmacynearbysearchplace','PharmacyController@getlistpharmacynearbysearchplace');

	Route::get('/pharmacy/grouppharmacybycity','PharmacyController@GroupPharmacyByCity');

	Route::get('pharmacy/pharmacybenefits/{pharmacyId}','PharmacyController@GetPharmacyBenefit');

//benefits

	Route::get('/benefit/listbenefit','BenefitsController@GetListBenefits');

//quotes

	Route::get('/quotes/getquotes','QuotesController@GetQuote');

	Route::get('user/completetutorial','UserController@CompleteTutorial');

});

Route::group(['middleware' => ['sessionadmin']], function () {

	Route::post('/health_care_facilities/addhcflocations', 'HcfController@AddHcfLocation');

	Route::post('/health_care_facilities/updatehcflocations', 'HcfController@EditHcfLocation');

	Route::get('/health_care_facilities/deletehcflocations', 'HcfController@DeleteHcfLocation');

	Route::post('/health_care_facilities/updatecardinfo','HcfController@UpdateDiscountCardInfo');

	Route::post('/pharmacy/editpharmacy','PharmacyController@EditPharmacy');

	Route::get('/pharmacy/deletepharmacy','PharmacyController@DeletePharmacy');

	Route::post('pharmacy/addcontractpharmacy','PharmacyController@AddContractPharmacy');

	Route::post('pharmacy/updatepharmacybenefit','PharmacyController@UpdatePharmacyBenefit');

	Route::post('/user/inviteuser','UserController@InviteUser');

	Route::get('/user/listhcfuser','UserController@GetHcfUser');

	Route::get('/user/removemember','UserController@RemoveMember');

	Route::get('user/getonlineusers','UserController@GetOnlineUser');

    Route::post('user/alluserpatient','UserController@UserPatientDetails');

    Route::post('user/changerole','UserController@ChangeRole');

    Route::post('user/addgoal','UserController@AddGoal');

    Route::post('patientcapture/patientscapturesumary','PatientCaptureController@PatientsCaptureSumary');

    Route::post('health_care_facilities/updateintroduction','HcfController@UpdateHcfIntroduction');

    Route::post('patientcapture/softwareusage','PatientCaptureController@SoftwareUsage');

    Route::post('hcf/addbaseline','HcfController@UpdateHcfUploadBaseLine');

    Route::get('hcf/getbaseline','HcfController@GetHcfBaseLine');

});

Route::group(['middleware' => ['superadmin']], function () {

	Route::post('/health_care_facilities/addhcf','HcfController@AddHcf');

	Route::get('/health_care_facilities/getlisthcf','HcfController@GetListHcf');

	Route::post('/health_care_facilities/updatehcf','HcfController@UpdateHcf');

	Route::get('health_care_facilities/deletehcf','HcfController@DeleteHcf');

	Route::get('health_care_facilities/listlocation','HcfController@GetListLocationByHcfId');

	Route::get('pharmacy/allpharmacy','PharmacyController@GetAllPharmacyByHcfId');

	Route::get('health_care_facilities/alluser','UserController@GetAllUserByHcf');

	Route::post('user/invitemember','UserController@InviteMember');

	Route::post('user/updateinfo','UserController@UpdateMember');

	Route::post('user/rewardtoken','UserController@RewardToken');

});

Route::post('user/login', 'UserController@Login');

Route::post('/user/forgotpassword','UserController@ForgotPassword');

Route::post('/user/resetpassword','UserController@ResetPassword');

Route::post('user/emailcart','UserController@EmailSavingCard');

Route::get('overviewvideo','UserController@GetOverViewVideo');

Route::post('signupmail','UserController@SignUpMail');

Route::post('user/loginadmin','UserController@LoginAdmin');

Route::get('faq/list','FAQController@ListFAQ');

Route::post('faq/add','FAQController@AddFAQ');

Route::post('faq/update','FAQController@UpdateFAQ');

Route::get('faq/delete','FAQController@DeleteFAQ');

Route::group(['middleware' => ['reportmanager']],function() {

    Route::post('hcf/uploadreport','HcfController@UploadReport');

    Route::get('hcf/uploadhistory','HcfController@GetReportUploadHistory');

    Route::get('report/prescriberdata','ReportController@GetProviderData');


    Route::get('report/uploadhistory','ReportController@GetUploadHistory');

    Route::get('report/pharmacydata','ReportController@GetPharmacyData');

    Route::get('report/deletemonthly','ReportController@DeleteReportDataByMonth');

    Route::post('report/upload','ReportController@UploadReport');

    Route::get('report/emrdata','ReportController@GetEmrData');

    Route::get('report/heatmap','ReportController@GetPharmacyHeatMap');

    Route::post('repport/uploadspecific','ReportController@UploadSpecificFile');
});







	







