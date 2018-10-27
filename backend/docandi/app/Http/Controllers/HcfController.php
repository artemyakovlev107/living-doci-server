<?php

namespace App\Http\Controllers;

require_once base_path('vendor/autoload.php');

use App\Models\PatientCaptureModel;
use App\Models\PharmacyModel;
use App\Models\Report;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Constants\Constants;
use App\Models\HcfModel;
use App\Models\Response;
use App\Models\UserModel;
use App\Models\RewardModel;
use Carbon\Carbon;
use PHPExcel_IOFactory;
use Session;
use Validator;
use PHPExcel;
use DateTime;
use DB;
session_start();

class HcfController extends Controller
{
    public $hcfObj;

    public function __construct()
    {
        $this->hcfObj = new HcfModel();
    }

    public function GetListHcf()
    {
        $responseData = new Response;
        $listHcf = $this->hcfObj->GetListHcf();
        if (!empty($listHcf)) {
            $responseData->Data = $listHcf;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = "";
            $responseData->Message = Constants::RESPONSE_STATUS_HCF_NOTFOUND;
        }
        return json_encode($responseData);
    }

    public function GetHcfDetails()
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response;
        $hcfDetails = $this->hcfObj->GetHcfDetails($user->health_care_facility_id);
        $userObj = new UserModel();
        $topUser = $userObj->GetTopUser($user->health_care_facility_id);
        if (!empty($hcfDetails)) {
            $hcfDetails->TopUser = $topUser;
            $responseData->Data = $hcfDetails;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = "";
            $responseData->Message = Constants::RESPONSE_STATUS_HCF_NOTFOUND;
        }
        return json_encode($responseData);
    }

    public function GetListHcfLocation()
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $listHcfLocation = $this->hcfObj->GetListHcfLocation($user->health_care_facility_id);
        if (!empty($listHcfLocation)) {
            $responseData->Data = $listHcfLocation;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = array();
            $responseData->Message = Constants::RESPONSE_STATUS_HCF_NOTFOUND;
        }
        return json_encode($responseData);
    }

    public function GetListLocationByHcfId(Request $request)
    {
        $responseData = new Response;
        $checkHcf = $this->hcfObj->GetHcfById($request->hcfId);
        if (empty($checkHcf)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_STATUS_HCF_NOTFOUND;
        } else {
            $listHcfLocation = $this->hcfObj->GetListHcfLocation($request->hcfId);
            if (!empty($listHcfLocation)) {
                $responseData->Data = $listHcfLocation;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Data = array();
                $responseData->Message = Constants::RESPONSE_STATUS_HCF_NOTFOUND;
            }
        }
        return json_encode($responseData);
    }

    public function AddHcfLocation(Request $request)
    {
        $responseData = new Response;
        if (empty($request->address) || empty($request->phone) || empty($request->name) || empty($request->email) || empty($request->city) || empty($request->state) || empty($request->zip) || empty($request->image) || empty($request->latitude) || empty($request->longitude)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $user = $_SESSION[Constants::SESSION_KEY_USER];
            $checkEmail = $this->hcfObj->CheckEmail(trim($request->input('email')));
            if (!empty($checkEmail)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_EMAIL_EXISTED;
            } else {
                if ($request->hasFile('image')) {
                    $file = $request->file('image');
                    $image_name = time() . $file->getClientOriginalName();
                    $image_url = Constants::CLINIC_IMAGE_URL . $image_name;
                    $request->file('image')->move(public_path(Constants::CLINIC_UPLOAD_IMAGE), $image_name);
                } else {
                    $image_url = '';
                }
                if (empty($request->hcf_id)) {
                    $listRequest = array(
                        'address' => $request->input('address'),
                        'phone' => $request->input('phone'),
                        'name' => $request->input('name'),
                        'email' => $request->input('email'),
                        'city' => $request->input('city'),
                        'state' => $request->input('state'),
                        'zip' => $request->input('zip'),
                        'image_url' => $image_url,
                        'latitude' => $request->input('latitude'),
                        'longitude' => $request->input('longitude'),
                        'health_care_facility_id' => $user->health_care_facility_id,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now()
                    );
                } else {
                    $listRequest = array(
                        'address' => $request->input('address'),
                        'phone' => $request->input('phone'),
                        'name' => $request->input('name'),
                        'email' => $request->input('email'),
                        'city' => $request->input('city'),
                        'state' => $request->input('state'),
                        'zip' => $request->input('zip'),
                        'image_url' => $image_url,
                        'latitude' => $request->input('latitude'),
                        'longitude' => $request->input('longitude'),
                        'health_care_facility_id' => $request->hcf_id,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now()
                    );
                }
                $addHcfLocation = $this->hcfObj->AddHcfLocation($listRequest);
                if (!empty($addHcfLocation)) {
                    $responseData->Data = $addHcfLocation;
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    $responseData->Data = "";
                }
            }
        }

        return json_encode($responseData);
    }


    public function EditHcfLocation(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if (empty($request->health_care_facility_id)) {
            $checkLocationId = $this->hcfObj->CheckHcfLocationId($request->id, $user->health_care_facility_id);
        } else {
            $checkLocationId = $this->hcfObj->CheckHcfLocationId($request->id, $request->health_care_facility_id);
        }
        if (empty($checkLocationId)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_LOCATION_NOTFOUND;
        } else {
            $checkEmailUpdate = $this->hcfObj->CheckEmailUpdate(trim($request->email), $request->id);
            if (!empty($checkEmailUpdate)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_EMAIL_EXISTED;
            } else {
                if ($request->hasFile('image')) {
                    $file = $request->file('image');
                    $image_name = time() . $file->getClientOriginalName();
                    $image_url = Constants::CLINIC_IMAGE_URL . $image_name;
                    $request->file('image')->move(public_path(Constants::CLINIC_UPLOAD_IMAGE), $image_name);
                    $listRequest = array(
                        'address' => $request->input('address'),
                        'phone' => $request->input('phone'),
                        'name' => $request->input('name'),
                        'email' => $request->input('email'),
                        'city' => $request->input('city'),
                        'state' => $request->input('state'),
                        'zip' => $request->input('zip'),
                        'image_url' => $image_url,
                        'latitude' => $request->input('latitude'),
                        'longitude' => $request->input('longitude'),
                        'updated_at' => Carbon::now()
                    );
                } else {
                    $listRequest = array(
                        'address' => $request->input('address'),
                        'phone' => $request->input('phone'),
                        'name' => $request->input('name'),
                        'email' => $request->input('email'),
                        'city' => $request->input('city'),
                        'state' => $request->input('state'),
                        'zip' => $request->input('zip'),
                        'latitude' => $request->input('latitude'),
                        'longitude' => $request->input('longitude'),
                        'updated_at' => Carbon::now()
                    );
                }
                $editHcfLocation = $this->hcfObj->UpdateHcfLocation($request->input('id'), $listRequest);
                if (!empty($editHcfLocation)) {
                    $responseData->Data = $editHcfLocation;
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                }
            }
        }
        return json_encode($responseData);
    }

    public function DeleteHcfLocation(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if ($user->role != Constants::USER) {
            $deleteHcfLocation = $this->hcfObj->DeleteHcfLocation($request->hcfId);
            if (!empty($deleteHcfLocation)) {
                $patientCaptureObj = new PatientCaptureModel();
                $deletPatientCapture = $patientCaptureObj->DeletePatientCaptureByLocationId($request->hcfId);
                $responseData->Data = $deleteHcfLocation;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Data = "";
            }
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ACCESS_IS_DENIED;
        }
        return json_encode($responseData);
    }

    public function AddHcf(Request $request)
    {
        $responseData = new Response;
        $userObj = new UserModel();
        $rewardObj = new RewardModel();
        if (empty($request->full_name) || empty($request->email) || empty($request->password) || empty($request->hospital_name) || empty($request->address) || empty($request->city) || empty($request->state) || empty($request->zip) || empty($request->phone) || empty($request->image)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $image_name = time() . $file->getClientOriginalName();
                $image_url = Constants::HCF_IMAGE_URL . $image_name;
                $request->file('image')->move(public_path(Constants::HCF_UPLOAD_IMAGE), $image_name);
            } else {
                $image_url = '';
            }
            $introduction = "<p><strong>" . $request->hospital_name . " has partnered with local pharmacies through a federal program. This program is designed to:</strong></p> <ul> <li><u>help patients save money on medications</u></li> <li><u>support " . $request->hospital_name . "with savings</u></li> </ul>";
            $addHcf = $this->hcfObj->AddHcf($request->hospital_name, $image_url, $introduction);
            $listRequest = array(
                'encrypted_password' => md5($request->password),
                'full_name' => $request->full_name,
                'avatar' => Constants::DEFAULT_AVATAR,
                'background' => Constants::DEFAULT_BACKGROUND,
                'email' => $request->email,
                'health_care_facility_id' => $addHcf,
                'city' => $request->city,
                'address' => $request->address,
                'state' => $request->state,
                'zip' => $request->zip,
                'phone' => $request->phone,
                'role' => Constants::HOSPITAL_ADMIN,
                'created_at' => Carbon::now(),
                'total_patient' => 0,
                'total_point' => 0,
                'token' => Constants::DEFAULT_TOKEN,
            );
            $addUser = $userObj->AddUser($listRequest);
            $addUserAvatar = $rewardObj->AddUserReward($addUser, Constants::DEFAULT_AVATAR);
            $addUserBackground = $rewardObj->AddUserReward($addUser, Constants::DEFAULT_BACKGROUND);
            if (empty($addHcf) || empty($addUser) || empty($addUserAvatar) || empty($addUserBackground)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            } else {
                $hcf = $this->hcfObj->GetHcfById($addHcf);
                $responseData->Data = $hcf;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            }
        }
        return json_encode($responseData);
    }

    public function UpdateHcf(Request $request)
    {
        $responseData = new Response;
        if (!isset($request->name)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $user = $_SESSION[Constants::SESSION_KEY_USER];
            if (empty($request->name)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
            } else {
                if ($request->hasFile('image')) {
                    $file = $request->file('image');
                    $image_name = time() . $file->getClientOriginalName();
                    $image_url = Constants::HCF_IMAGE_URL . $image_name;
                    $request->file('image')->move(public_path(Constants::HCF_UPLOAD_IMAGE), $image_name);
                    $listRequest = array(
                        'name' => $request->name,
                        'image_url' => $image_url,
                        'updated_at' => Carbon::now()
                    );
                } else {
                    $listRequest = array(
                        'name' => $request->name,
                        'updated_at' => Carbon::now()
                    );
                }
                if (empty($id)) {
                    $updateHcf = $this->hcfObj->UpdateHcf($request->id, $listRequest);
                } else {
                    $updateHcf = $this->hcfObj->UpdateHcf($user->health_care_facility_id, $listRequest);
                }
                if (!empty($updateHcf)) {
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                    $responseData->Data = $updateHcf;
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                }
            }
        }
        return json_encode($responseData);
    }

    public function UpdateHcfIntroduction(Request $request)
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response();
        $updateHcf = $this->hcfObj->UpdateHcfIntroduction($user->health_care_facility_id, $request->introduction);
        $responseData->Data = $updateHcf;
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        return json_encode($responseData);
    }

    public function DeleteHcf(Request $request)
    {
        $responseData = new Response();
        $checkHcf = $this->hcfObj->GetHcfById($request->hcfId);
        if (!empty($checkHcf)) {
            $deleteHcf = $this->hcfObj->DeleteHcf($request->hcfId);
            if (!empty($deleteHcf)) {
                $pharmacyObj = new PharmacyModel();
                $userObj = new UserModel();
                $deleteLocation = $pharmacyObj->DeletePharmacyByHcfId($request->hcfId);
                $deleteLocation = $this->hcfObj->DeleteHcfLocation($request->hcfId);
                $deleteUser = $userObj->DeleteUserByHcf($request->hcfId);
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                $responseData->Data = $deleteHcf;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            }
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_STATUS_HCF_NOTFOUND;
        }
        return json_encode($responseData);
    }

    public function UpdateDiscountCardInfo(Request $request)
    {
        $responseData = new Response();
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if (!isset($request->rxgrp) || !isset($request->input_code)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $image_name = time() . $file->getClientOriginalName();
                $image_url = Constants::DIS_COUNT_CARD . $image_name;
                $request->file('image')->move(public_path(Constants::DIS_COUNT_CARD_URL), $image_name);
            } else {
                $image_url = '';
            }
            $updateInfo = $this->hcfObj->UpdateDiscountCardInfo($user->health_care_facility_id, $request->rxgrp, $request->input_code, $image_url);
            if (!empty($updateInfo)) {
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                $responseData->Data = $updateInfo;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            }
            return json_encode($responseData);
        }
    }

    /**
     * @param Request $request
     * @return string
     */
    public function UploadReport (Request $request)
    {
        $responseData = new Response();
        $user =  $_SESSION[Constants::SESSION_KEY_USER];
        $input = $request->all();
        $validator = Validator::make($input,[
            'financial' => 'required',
        ]);
        if($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            /*foreach ($input['file'] as $key => $value) {
                if ($value->getClientOriginalName()) {
                    $extension = $value->getClientOriginalExtension();
                    if($extension != 'csv' && $extension != 'xls' && $extension != 'xlsx') {
                        $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                        $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
                        return json_encode($responseData);
                    } else {
                        dd(1);
                    }
                }
            }*/
            $emrUrl = '';
            if(!empty($input['emr'])) {
                if ($input['emr']->getClientOriginalName()) {
                    $emrExtension = $input['emr']->getClientOriginalExtension();
                    if($emrExtension != 'csv' && $emrExtension != 'xls' && $emrExtension != 'xlsx') {
                        $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                        $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
                        return json_encode($responseData);
                    } else {
                        $emrFileName = $input['emr']->getClientOriginalName();
                        $emrFileName = str_replace(' ', '-', $emrFileName);
                        $emrFileName = preg_replace('/[^A-Za-z0-9.\-]/', '', $emrFileName);
                        $emrFileName = str_random(6) . time() . $emrFileName;
                        $emrUrl = Constants::REPORT_UPLOAD_URL . $emrFileName;
                        $input['emr']->move(public_path(Constants::REPORT_UPLOAD_URL), $emrFileName);
                    }
                }
            }
            if ($input['financial']->getClientOriginalName()) {
                $financialExtension = $input['financial']->getClientOriginalExtension();
                if($financialExtension != 'csv' && $financialExtension != 'xls' && $financialExtension != 'xlsx') {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
                    return json_encode($responseData);
                } else {
                    $financialName = $input['financial']->getClientOriginalName();
                    $financialName = str_replace(' ', '-', $financialName);
                    $financialName = preg_replace('/[^A-Za-z0-9.\-]/', '', $financialName);
                    $financialName = str_random(6) . time() . $financialName;
                    $financialUrl = Constants::REPORT_UPLOAD_URL . $financialName;
                    $input['financial']->move(public_path(Constants::REPORT_UPLOAD_URL), $financialName);
                    $tmpfname = public_path(Constants::REPORT_UPLOAD_URL).$financialName;
                    $excelReader = PHPExcel_IOFactory::createReaderForFile($tmpfname);
                    $excelObj = $excelReader->load($tmpfname);
                    $sheet = $excelObj->getSheet(0);
                    $listAtribute = [];
                    $i=0;
                    $total = 0;
                    $reconciliation = 0;
                    $netIncrease = 0;
                    foreach ($sheet->getRowIterator() AS $row) {
                        if($i == 2) {
                            $j = 0;
                            $cellIterator = $row->getCellIterator();
                            $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                            foreach ($cellIterator as $cell) {
                                if($j==4) {
                                    $timePeriod = $cell->getValue();
                                    $timePeriod = preg_replace('/[^A-Za-z0-9\- ]/', '', $timePeriod);
                                    $timePeriod = trim(str_replace('time period','',strtolower($timePeriod)));
                                    $timeStamp = date("Y-m-d H:i:s",strtotime($timePeriod));
                                    $reportObj = new Report();
                                    $checkReport = $reportObj->GetReportByTimeFrame($user->health_care_facility_id,$timeStamp);
                                    if(empty($checkReport)) {
                                        $listRequest = array(
                                            'hcf_id' => $user->health_care_facility_id,
                                            'financial_url' => $financialUrl,
                                            'emr_url' => $emrUrl,
                                            'date' => $timeStamp,
                                            'submitted_by' => $user->id,
                                            'created_at' => Carbon::now(),
                                            'updated_at' => Carbon::now()
                                        );
                                        $addReport = $reportObj->AddReport($listRequest);
                                    } else {
                                        $listRequest = array(
                                            'hcf_id' => $user->health_care_facility_id,
                                            'financial_url' => $financialUrl,
                                            'emr_url' => $emrUrl,
                                            'date' => $timeStamp,
                                            'submitted_by' => $user->id,
                                            'created_at' => $checkReport->created_at,
                                            'updated_at' => Carbon::now()
                                        );
                                        $updateReport = $reportObj->UpdateReport($checkReport->id,$listRequest);
                                    }
                                    break;
                                }
                                $j++;
                            }
                        }
                        if($i == 7) {
                            $cellIterator = $row->getCellIterator();
                            $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                            foreach ($cellIterator as $cell) {
                                $value = $cell->getValue();
                                array_push($listAtribute,$value);
                            }
                        }

                        if($i == 12) {
                            $j = 0;
                            $cellIterator = $row->getCellIterator();
                            $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                            foreach ($cellIterator as $cell) {
                                if($j==12) {
                                    $total = $cell->getValue();
                                    break;
                                }
                                $j++;
                            }
                        }
                        if($i == 13) {
                            $j = 0;
                            $cellIterator = $row->getCellIterator();
                            $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                            foreach ($cellIterator as $cell) {
                                if($j==12) {
                                    $reconciliation = $cell->getValue();
                                    break;
                                }
                                $j++;
                            }
                        }
                        if($i == 14) {
                            $j = 0;
                            $cellIterator = $row->getCellIterator();
                            $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                            foreach ($cellIterator as $cell) {
                                if($j==12) {
                                    $netIncrease = $cell->getValue();
                                    break;
                                }
                                $j++;
                            }
                            break;
                        }
                        $i++;
                    }
                    $data = objectValue();
                    $data->timePeriod = $timeStamp;
                    $data->listAtribute = $listAtribute;
                    $data->total = $total;
                    $data->reconciliation = - $reconciliation;
                    $data->netIncrease = $netIncrease;
                    $responseData->Data = $data;
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                }
            }
        }
        return json_encode($responseData);
    }

    /*public function GetReportUploadHistory()
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response();
        $reportObj = new Report();
        $uploadHistory = $reportObj->GetUploadHistoryByHcfId($user->health_care_facility_id);
        $data = array();
        $historyLength = count($uploadHistory);
        for($i=0; $i<$historyLength; $i++) {
            if($i == 0) {
                array_push($data,$uploadHistory[$i]);
            } else {
                $d1 = new DateTime($uploadHistory[$i]->date);
                $d2 = new DateTime($uploadHistory[$i-1]->date);
                $interval = date_diff($d1,$d2);
                $interval = $interval->y*12 + $interval->m;
                for($j=1; $j<$interval;$j++) {
                    $monthlyData = objectValue();
                    $monthlyData->date = date("Y-m-d",strtotime($uploadHistory[$i-1]->date. '+ '.$j.' month'));
                    array_push($data,$monthlyData);
                }
                array_push($data,$uploadHistory[$i]);
            }
        }
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        $responseData->Data = $data;
        return json_encode($responseData);
    }*/
    public function GetReportUploadHistory()
    {
        $responseData = new Response();
        $uploadHistory = DB::table('report')
            ->select('report.*', 'user.full_name as fullname')
            ->join('user', 'user.id', '=', 'report.submitted_by')
            ->orderBy('report.date')
            ->get();
        $data = array();
        $historyLength = count($uploadHistory);
        for ($i = 0; $i < $historyLength; $i++) {
            if ($i == 0) {
                array_push($data, $uploadHistory[$i]);
            } else {
                $d1 = new DateTime($uploadHistory[$i]->date);
                $d2 = new DateTime($uploadHistory[$i - 1]->date);
                $interval = date_diff($d1, $d2);
                $interval = $interval->y * 12 + $interval->m;
                for ($j = 1; $j < $interval; $j++) {
                    $monthlyData = objectValue();
                    $monthlyData->date = date("Y-m-d", strtotime($uploadHistory[$i - 1]->date . '+ ' . $j . ' month'));
                    array_push($data, $monthlyData);
                }
                array_push($data, $uploadHistory[$i]);
            }
        }
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        $responseData->Data = $data;
        return json_encode($responseData);
    }
    public function UpdateHcfUploadBaseLine (Request $request)
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response();
        $input = $request->all();
        $validator = Validator::make($input,[
            'claim_type' => 'required',
            'rx_claim_sold_start' => 'required',
            'rx_claim_sold_end' => 'required',
            'number_rxs' => 'required',
            'estimated_340b_cost' => 'required',
            'plan_ar_amount' => 'required',
            'copay_amount' => 'required',
            'saled_tax' => 'required',
            'admin_fee' => 'required',
            'dispense_fee' => 'required',
            'insured_admin_fee' => 'required',
            'client_fee' => 'required',
            'increased_access_dollars' => 'required',
            'total' => 'required',
            'reconciliation_adjustment' => 'required',
            'retail_net_increase_access_dollar' => 'required',
            'rx_reversals' => 'required',
        ]);
        if($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            $hcfBaseLine = $this->hcfObj->GetUploadBaseLineByHcf($user->health_care_facility_id);
            if(empty($hcfBaseLine)) {
                $listRequest =  array(
                    'hcf_id' => $user->health_care_facility_id,
                    'claim_type' => $input['claim_type'],
                    'rx_claim_sold_start' => $input['rx_claim_sold_start'],
                    'rx_claim_sold_end' => $input['rx_claim_sold_end'],
                    'number_rxs' => $input['number_rxs'],
                    'estimated_340b_cost' => $input['estimated_340b_cost'],
                    'plan_ar_amount' => $input['plan_ar_amount'],
                    'copay_amount' => $input['copay_amount'],
                    'saled_tax' => $input['saled_tax'],
                    'admin_fee' => $input['admin_fee'],
                    'dispense_fee' => $input['dispense_fee'],
                    'insured_admin_fee' => $input['insured_admin_fee'],
                    'client_fee' => $input['client_fee'],
                    'increased_access_dollars' => $input['increased_access_dollars'],
                    'total' => $input['total'],
                    'reconciliation_adjustment' => $input['reconciliation_adjustment'],
                    'retail_net_increase_access_dollar' => $input['retail_net_increase_access_dollar'],
                    'rx_reversals' => $input['rx_reversals'],
                );
                $addHcfBaseLine = $this->hcfObj->AddHcfUploadBaseLine($listRequest);
            } else {
                $listRequest =  array(
                    'hcf_id' => $user->health_care_facility_id,
                    'claim_type' => $input['claim_type'],
                    'rx_claim_sold_start' => $input['rx_claim_sold_start'],
                    'rx_claim_sold_end' => $input['rx_claim_sold_end'],
                    'number_rxs' => $input['number_rxs'],
                    'estimated_340b_cost' => $input['estimated_340b_cost'],
                    'plan_ar_amount' => $input['plan_ar_amount'],
                    'copay_amount' => $input['copay_amount'],
                    'saled_tax' => $input['saled_tax'],
                    'admin_fee' => $input['admin_fee'],
                    'dispense_fee' => $input['dispense_fee'],
                    'insured_admin_fee' => $input['insured_admin_fee'],
                    'client_fee' => $input['client_fee'],
                    'increased_access_dollars' => $input['increased_access_dollars'],
                    'total' => $input['total'],
                    'reconciliation_adjustment' => $input['reconciliation_adjustment'],
                    'retail_net_increase_access_dollar' => $input['retail_net_increase_access_dollar'],
                    'rx_reversals' => $input['rx_reversals'],
                );
                $updateHcfBaseLine = $this->hcfObj->UpdateHcfUploadBaseLine($listRequest,$user->health_care_facility_id);
            }
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            $responseData->Data = 1;
        }
        return json_encode($responseData);
    }

    public function GetHcfBaseLine()
    {
        $responseData = new Response();
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $hcfBaseLine = $this->hcfObj->GetUploadBaseLineByHcf($user->health_care_facility_id);
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        $responseData->Data = $hcfBaseLine;
        return json_encode($responseData);
    }

}
