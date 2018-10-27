<?php

namespace App\Http\Controllers;

use App\Models\BenefitsModel;
use App\Models\HcfModel;
use App\Models\PharmacyModel;
use App\Models\RewardModel;
use App\Models\TimeTrackingModel;
use Illuminate\Http\Request;
use DateTime;
use App\Http\Requests;
use App\Models\Response;
use App\Constants\Constants;
use App\Models\PatientCaptureModel;
use App\Models\UserModel;
use Session;
use Carbon\Carbon;

session_start();

class PatientCaptureController extends Controller
{
    public $patientCaptureObj;

    public function __construct()
    {
        $this->patientCaptureObj = new PatientCaptureModel();
    }
    public function CreatePatientCapture(Request $request)
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response;
        $arrayInput = json_decode($request->getContent(), true);
        if(!isset($arrayInput['pharmacy_id'])||!isset($arrayInput['is_using_340b'])||!isset($arrayInput['agree_to_change'])
            ||!isset($arrayInput['informed_340b_benefit'])||!isset($arrayInput['informed_pharmacy_location'])||!isset($arrayInput['alerted_doctor'])
            ||!isset($arrayInput['time_for_step_1'])||!isset($arrayInput['time_for_step_2'])
            ||!isset($arrayInput['hcf_location_id'])||!isset($arrayInput['is_recommend'])||!isset($arrayInput['map_viewed'])
            ||!isset($arrayInput['benefits_viewed'])){
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $hcfObj = new HcfModel();
            $checkLocation = $hcfObj->GetHcfLocationById($arrayInput['hcf_location_id']);
            if($arrayInput['pharmacy_id'] != 0){
                $pharmacyObj = new PharmacyModel();
                $checkPharmacy = $pharmacyObj->GetPharmacyById($arrayInput['pharmacy_id']);
            } else {
                $checkPharmacy = 1;
            }
            if(empty($checkLocation) || empty($checkPharmacy)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
            } else{
                if($arrayInput['is_using_340b'] == 1)
                {
                    $point = Constants::IS_USING_340B + Constants::SELECT_PHARMACY + Constants::INFORMED_BENEFITS * $arrayInput['informed_340b_benefit'] + Constants::SUBMIT_USING;
                    $status = 1;
                    $saving = Constants::SAVING_MONEY_USED;
                } else {
                    if($arrayInput['agree_to_change'] == 1) {
                        $point = Constants::IS_NOT_USING_340B + Constants::INFORMED_BENEFITS * $arrayInput['informed_340b_benefit'] +Constants::INFORMED_PHARMACY_LOCATION * $arrayInput['informed_pharmacy_location'] + Constants::NEXT_SUBMIT + Constants::AGREE_TO_CHANGE + Constants::SELECT_PHARMACY + Constants::ALERTED_DOCTOR * $arrayInput['alerted_doctor'] + Constants::TOLD_FREEDOM_CHOICE * $arrayInput['told_freedom_choice'] + Constants::SUMIT_CHANGE;
                        $status = 2;
                        $saving = Constants::SAVING_MONEY_CHANGE;
                    } else {
                        $point = Constants::IS_NOT_USING_340B + Constants::INFORMED_BENEFITS * $arrayInput['informed_340b_benefit'] + Constants::INFORMED_PHARMACY_LOCATION * $arrayInput['informed_pharmacy_location'] + Constants::NEXT_SUBMIT + Constants::NOT_AGREE_TO_CHANGE + Constants::SELECTED_REASON + Constants::SUBMIT_NOT_CHANGE;
                        $status = 3;
                        $saving = 0;
                    }
                }
                $listRequest = array(
                    'user_id' => $user->id,
                    'status' => $status,
                    'pharmacy_id' => $arrayInput['pharmacy_id'],
                    'reason' => $arrayInput['reason'],
                    'is_using_340b' => $arrayInput['is_using_340b'],
                    'agree_to_change' => $arrayInput['agree_to_change'],
                    'informed_340b_benefit' => $arrayInput['informed_340b_benefit'],
                    'informed_pharmacy_location' => $arrayInput['informed_pharmacy_location'],
                    'alerted_doctor' => $arrayInput['alerted_doctor'],
                    'told_freedom_choice' => $arrayInput['told_freedom_choice'],
                    'patient_phone' => $arrayInput['patient_phone'],
                    'point' => $point,
                    'saving' => $saving,
                    'created_at' => Carbon::now(),
                    'time_for_step_1' => $arrayInput['time_for_step_1'],
                    'time_for_step_2' => $arrayInput['time_for_step_2'],
                    'hcf_location_id' => $arrayInput['hcf_location_id'],
                    'health_care_facility_id' => $user->health_care_facility_id,
                    'use_recommend_pharmacy' => $arrayInput['is_recommend'],
                    'used_map' => $arrayInput['map_viewed']
                );
                $patientCapture = $this->patientCaptureObj->CreatePatientCapture($listRequest);
                if(!empty($patientCapture)){
                    $userObj = new UserModel();
                    $userDetails = $userObj->GetUserDetails($user->id);
                    $tokenAdded = (int)($userDetails->total_point / Constants::TOKEN_COST);
                    $totalPoint = $userDetails->total_point + $point;
                    $newToken = (int)($totalPoint / Constants::TOKEN_COST);
                    if($newToken != $tokenAdded) {
                        $token = $userDetails->token + $newToken - $tokenAdded;
                    } else {
                        $token = $userDetails->token;
                    }
                    $totalPatient = $userDetails->total_patient + 1;
                    $addPoint = $userObj->AddPoint($user->id,$totalPoint,$totalPatient,$token);
                    $benefitView = $arrayInput['benefits_viewed'];
                    $arrayBenefit = array();
                    for($i=0; $i<count($benefitView); $i++) {
                        if($benefitView[$i]['viewed'] == 1) {
                            array_push($arrayBenefit,array(
                                "patient_capture_id" => $patientCapture,
                                "benefit_id" => $benefitView[$i]['id']
                            ));
                        }
                    }
                    $addBenefitsMapViewed = $this->patientCaptureObj->AddBenefitsMapViewed($arrayBenefit);
                    if(!empty($addBenefitsMapViewed) && !empty($addPoint)){
                        $responseData->Data = $patientCapture;
                        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                    } else {
                        $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    }
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                }
            }
        }
        return json_encode($responseData);
    }

    public function PatientsCaptureSumary(Request $request)
    {
        $responseData = new Response();
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if(!isset($request->location_id) || !isset($request->date_start) || !isset($request->date_end) || !isset($request->time_zone)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $date_start = $request->date_start;
            $date_end = $request->date_end;
            $offsetTime = (string)$request->time_zone." hours";
            $date_end = strtotime(date("Y-m-d", strtotime($date_end)) . " +1 day");
            $date_end = strftime("%Y-%m-%d",$date_end);
            $location_id = $request->location_id;
            $patientsCaptureSumary = $this->patientCaptureObj->PatientsCaptureSumary($date_start,$date_end,$location_id,$user->health_care_facility_id);
            if(!empty($patientsCaptureSumary)) {
                $patientsCaptureSumary = $patientsCaptureSumary[0];
                $patientsCaptureSumary->MonthSaving = $this->patientCaptureObj->GetListTotalMonthPatientSavingByLocation($request->location_id,$user->health_care_facility_id);
                $reason = $this->patientCaptureObj->GetReasonSumary($date_start,$date_end,$location_id,$user->health_care_facility_id);
                $reason1= array('reason' =>-1,'patientNumber'=>0);
                $reason2= array('reason' =>1,'patientNumber'=>0);
                $reason3= array('reason' =>2,'patientNumber'=>0);
                if(count($reason) == 0) {
                    array_push($reason,$reason1,$reason2,$reason3);
                } elseif(count($reason) == 1) {
                    if($reason[0]->reason == -1) {
                        array_push($reason,$reason2,$reason3);
                    } elseif($reason[0]->reason == 1) {
                        array_push($reason,$reason3);
                        array_unshift($reason,$reason1);
                    } elseif($reason[0]->reason == 2) {
                        array_unshift($reason,$reason2);
                        array_unshift($reason,$reason1);
                    }
                } elseif(count($reason) == 2) {
                    if($reason[0]->reason != -1) {
                        array_push($reason,$reason1);
                    } elseif($reason[0]->reason != 1) {
                        array_pop($reason);
                        array_push($reason,$reason2,$reason3);
                    } else {
                        array_push($reason,$reason3);
                    }
                }
                $patientsCaptureSumary->Reason = $reason;
                $patientsCaptureSumary->TopCurrentPharmacy = $this->patientCaptureObj->GetTopCurrentPharmacy($date_start,$date_end,$location_id,$user->health_care_facility_id);
                $patientsCaptureSumary->TopSwitchLocation = $this->patientCaptureObj->GetTopSwitchLocation($date_start,$date_end,$location_id,$user->health_care_facility_id);
                $patientsCaptureSumary->PickedPreferred = $this->patientCaptureObj->PickedPreferred($date_start,$date_end,$location_id,$user->health_care_facility_id);
                $responseData->Data = $patientsCaptureSumary;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            }
        }
        return json_encode($responseData);
    }

    public function SubDate($dateStart,$dateEnd)
    {
        $dateStart = new DateTime($dateStart);
        $dateEnd = new DateTime($dateEnd);
        $diff = $dateStart->diff($dateEnd);
        return $diff;
    }

    public function SoftwareUsage(Request $request)
    {
        $responseData = new Response();
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if(!isset($request->location_id) || !isset($request->date_start) || !isset($request->date_end) || !isset($request->time_zone)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $userObj = new UserModel();
            $benefitObj = new BenefitsModel();
            $timeTrackingObj = new TimeTrackingModel();
            $date_start = $request->date_start;
            $date_end = $request->date_end;
            $date_end = strtotime(date("Y-m-d", strtotime($date_end)) . " +1 day");
            $date_end = strftime("%Y-%m-%d",$date_end);
            $location_id = $request->location_id;
            $softwareUsage= $this->patientCaptureObj->SoftwareUsage($date_start,$date_end,$location_id,$user->health_care_facility_id)[0];
            $countOnlineNumber = array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
            $onlineUserSumary = $timeTrackingObj->GetNumberOfOnlineUsers($date_start,$date_end,$user->health_care_facility_id);
            if(!empty($onlineUserSumary)) {
                foreach ($onlineUserSumary as $key => $value) {
                    $value = json_decode($value->time_online);
                    foreach ($value as $k => $v) {
                        $countOnlineNumber[(int)$v] +=1;
                    }
                }
            }
            for($i=0; $i<count($countOnlineNumber);$i++) {
                $countOnlineNumber[$i] = $countOnlineNumber[$i]/($this->SubDate($date_start,$date_end)->days);
            }
            $softwareUsage->UsersOnline = $countOnlineNumber;
            $softwareUsage->TotalFreedomChoicePickedSumary = $this->patientCaptureObj->TotalFreedomChoicePickedSumary($location_id,$user->health_care_facility_id);
            $softwareUsage->TotalMonthlyPatient = $this->patientCaptureObj->GetTotalMonthPatientByHcf($location_id,$user->health_care_facility_id);
            $listBenefit = $benefitObj->ListBenefits();
            $softwareUsage->MapViewed = array();
            for($i=0; $i<count($listBenefit); $i++) {
                $softwareUsage->MapViewed[$listBenefit[$i]->id] = $this->patientCaptureObj->MapView($date_start,$date_end,$location_id,$user->health_care_facility_id,$listBenefit[$i]->id);
            }
            $softwareUsage->AverageTimePerPatient = $this->patientCaptureObj->AverageTimePerPatient($date_start,$date_end,$location_id,$user->health_care_facility_id);
            $softwareUsage->AverageTimePerPatientNotSwitch = $this->patientCaptureObj->AverageTimePerPatientNotSwitch($date_start,$date_end,$location_id,$user->health_care_facility_id);
            $timesChangedAvatar = $userObj->TimesChangedAvatar($user->health_care_facility_id);
            if($timesChangedAvatar != null) {
                $softwareUsage->TimesChangedAvatar = $userObj->TimesChangedAvatar($user->health_care_facility_id);
            } else {
                $softwareUsage->TimesChangedAvatar = 0;
            }
            $timesChangeBackground = $userObj->TimesChangedBackground($user->health_care_facility_id);
            if($timesChangeBackground != null) {
                $softwareUsage->TimesChangeBackground = $userObj->TimesChangedBackground($user->health_care_facility_id);
            } else {
                $softwareUsage->TimesChangeBackground = 0;
            }
            $listUser = $userObj->GetHcfUser($user->health_care_facility_id);
            $totalEarnedToken = 0;
            for($i=0; $i<count($listUser);$i++) {
                $totalEarnedToken = $totalEarnedToken + (int)($listUser[$i]->total_point/Constants::TOKEN_COST);
            }
            $totalToken = $userObj->GetTotalToken($user->health_care_facility_id);
            $softwareUsage->totalToken = $totalEarnedToken;
            $rewardObj = new RewardModel();
            $softwareUsage->TokenRedeemed = (int)($rewardObj->GetTokenRedeem($user->health_care_facility_id));
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            $responseData->Data = $softwareUsage;
        }
        return json_encode($responseData);
    }
}
