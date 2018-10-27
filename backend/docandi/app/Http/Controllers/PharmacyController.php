<?php

namespace App\Http\Controllers;

use App\Constants\Constants;
use Illuminate\Http\Request;
use App\Models\Response;
use App\Http\Controllers\Controller;
use App\Models\PharmacyModel;
use App\Models\BenefitsModel;
use App\Models\HcfModel;
use Illuminate\Queue\RedisQueue;
use Session;
use Carbon\Carbon;

session_start();

class PharmacyController extends Controller
{
    public $pharmacyObj;

    public function __construct()
    {
        $this->pharmacyObj = new PharmacyModel();
    }

    public function GetListPharmacyByHcfId(Request $request)
    {
        $responseData = new Response;
        $page = $request->input('page');
        $page = $page * Constants::LIMIT_PHARMACY - Constants::LIMIT_PHARMACY;
        $listPharmacy = $this->pharmacyObj->GetListPharmacyByHcfId($request->input('hcfId'), $page);
        $numberOfPharmacy = $this->pharmacyObj->GetNumberOfPharmacy($request->input('hcfId'));
        if (!empty($listPharmacy)) {
            foreach ($listPharmacy as $key => $value) {
                $value->benefitName = explode(',', $value->benefitName);
                $value->numberOfPharmacy = $numberOfPharmacy;
            }
            $responseData->Data = $listPharmacy;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = "";
        }
        return json_encode($responseData);
    }

    public function GetAllPharmacyByHcfId(Request $request)
    {
        $responseData = new Response;
        $listPharmacy = $this->pharmacyObj->GetPharmacyByHcfId($request->input('hcfId'));
        if (!empty($listPharmacy)) {
            foreach ($listPharmacy as $key => $value) {
                $value->benefitName = explode(',', $value->benefitName);
            }
            $responseData->Data = $listPharmacy;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = "";
        }
        return json_encode($responseData);
    }

    public function GetListPharmacyNearbyHcfLocation(Request $request)
    {
        $responseData = new Response;
        $hcfObj = new HcfModel();
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $hcfLocationDetails = $hcfObj->GetHcfLocationDetails($request->hcf_location_id);
        $listPharmacy = $this->pharmacyObj->GetListPharmacyNearbyHcfLocation($user->health_care_facility_id, $hcfLocationDetails->latitude, $hcfLocationDetails->longitude, $request->benefit_id, $request->sort);
        if (!empty($listPharmacy)) {
            foreach ($listPharmacy as $key => $value) {
                $value->benefit = explode(',', $value->benefit);
                for ($i = 0; $i < count($value->benefit); $i++) {
                    $value->benefit[$i] = explode(';', $value->benefit[$i]);
                }
            }
            $responseData->Data = $listPharmacy;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = array();
        }
        return json_encode($responseData);
    }

    public function EditPharmacy(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if ($user->role != Constants::USER) {
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $image_name = time() . $file->getClientOriginalName();
                $image_url = Constants::PHARMACY_IMAGE_URL . $image_name;
                $request->file('image')->move(public_path(Constants::PHARMACY_UPLOAD_IMAGE), $image_name);
                $listRequest = array(
                    'name' => $request->input('name'),
                    'address' => $request->input('address'),
                    'phone' => $request->input('phone'),
                    'email' => $request->input('email'),
                    'city' => $request->input('city'),
                    'state' => $request->input('state'),
                    'zip' => $request->input('zip'),
                    'latitude' => $request->input('latitude'),
                    'longitude' => $request->input('longitude'),
                    'short_code' => $request->input('short_code'),
                    'logo' => $image_url,
                    'status' => $request->input('status'),
                    'updated_at' => Carbon::now()
                );
            } else {
                $listRequest = array(
                    'name' => $request->input('name'),
                    'address' => $request->input('address'),
                    'phone' => $request->input('phone'),
                    'email' => $request->input('email'),
                    'city' => $request->input('city'),
                    'state' => $request->input('state'),
                    'zip' => $request->input('zip'),
                    'latitude' => $request->input('latitude'),
                    'longitude' => $request->input('longitude'),
                    'short_code' => $request->input('short_code'),
                    'status' => $request->input('status'),
                    'updated_at' => Carbon::now()
                );
            }
            $editPharmacy = $this->pharmacyObj->EditPharmacy($request->input('id'), $listRequest);
            if (!empty($editPharmacy)) {
                $responseData->Data = $editPharmacy;
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

    public function DeletePharmacy(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if ($user->role != Constants::USER) {
            $deletePharmacy = $this->pharmacyObj->DeletePharmacy($request->id);
            if (!empty($deletePharmacy)) {
                $responseData->Data = $deletePharmacy;
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

    public function GetAllPharmacy()
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response;
        $listPharmacy = $this->pharmacyObj->GetAllPharmacy($user->health_care_facility_id);
        if (!empty($listPharmacy)) {
            $responseData->Data = $listPharmacy;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = array();
        }
        return json_encode($responseData);
    }

    public function GetListPharmacyNearbySearchPlace(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $listPharmacy = $this->pharmacyObj->GetListPharmacyNearbySearchPlace($user->health_care_facility_id, $request->latitude, $request->longitude, $request->benefit_id, $request->sort);
        if (!empty($listPharmacy)) {
            foreach ($listPharmacy as $key => $value) {
                $value->benefit = explode(',', $value->benefit);
                for ($i = 0; $i < count($value->benefit); $i++) {
                    $value->benefit[$i] = explode(';', $value->benefit[$i]);
                }
            }
            $responseData->Data = $listPharmacy;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = array();
        }
        return json_encode($responseData);
    }

    public function GroupPharmacyByCity()
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $listPharmacy = $this->pharmacyObj->GroupPharmacyByCity($user->health_care_facility_id);
        if (!empty($listPharmacy)) {
            foreach ($listPharmacy as $key => $value) {
                $value->Data = explode(';', $value->Data);
                    for($i=0;$i<count($value->Data);$i++) {
                        if(empty($value->Data[$i])) {
                            unset($value->Data[$i]);
                        } else {
                            $value->Data[$i] =  explode('-',$value->Data[$i]);
                        }
                    }
                }
            $responseData->Data = $listPharmacy;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            $responseData->Data = array();
        }
        return json_encode($responseData);
    }

    public static function vincentyGreatCircleDistance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 3959)
    {
        $latFrom = deg2rad($latitudeFrom);
        $lonFrom = deg2rad($longitudeFrom);
        $latTo = deg2rad($latitudeTo);
        $lonTo = deg2rad($longitudeTo);

        $lonDelta = $lonTo - $lonFrom;
        $a = pow(cos($latTo) * sin($lonDelta), 2) +
            pow(cos($latFrom) * sin($latTo) - sin($latFrom) * cos($latTo) * cos($lonDelta), 2);
        $b = sin($latFrom) * sin($latTo) + cos($latFrom) * cos($latTo) * cos($lonDelta);
        $angle = atan2(sqrt($a), $b);
        return number_format($angle * $earthRadius, 2);
    }

    public function AddContractPharmacy(Request $request)
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response;
        if (empty($request->name) || empty($request->address) || empty($request->phone) || empty($request->email) || empty($request->city) || empty($request->state) || empty($request->zip) || empty($request->latitude) || empty($request->longitude)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $checkEmail = $this->pharmacyObj->GetPharmacyByEmail(trim($request->email));
            if (empty($checkEmail)) {
                if ($request->hasFile('image')) {
                    $file = $request->file('image');
                    $image_name = time() . $file->getClientOriginalName();
                    $image_url = Constants::PHARMACY_IMAGE_URL . $image_name;
                    $request->file('image')->move(public_path(Constants::PHARMACY_UPLOAD_IMAGE), $image_name);
                } else {
                    $image_name = '';
                }
                $listRequest = array(
                    'name' => $request->name,
                    'address' => $request->address,
                    'phone' => $request->phone,
                    'email' => $request->email,
                    'city' => $request->city,
                    'state' => $request->state,
                    'zip' => $request->zip,
                    'latitude' => $request->latitude,
                    'longitude' => $request->longitude,
                    'logo' => $image_url,
                    'status' => 1,
                    'created_at' => Carbon::now(),
                );
                $addPharmacy = $this->pharmacyObj->AddPharmacy($listRequest);
                if (!empty($addPharmacy)) {
                    if (empty($request->health_care_facility_id)) {
                        $addContractPharmacy = $this->pharmacyObj->AddContractPharmacy($addPharmacy, $user->health_care_facility_id);
                    } else {
                        $addContractPharmacy = $this->pharmacyObj->AddContractPharmacy($addPharmacy, $request->health_care_facility_id);
                    }
                    if (!empty($addContractPharmacy)) {
                        $responseData->Data = $addPharmacy;
                        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                    } else {
                        $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    }
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                }
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_EMAIL_EXISTED;
            }
        }
        return json_encode($responseData);
    }

    public function UpdatePharmacyBenefit(Request $request)
    {
        $responseData = new Response;
        $arrayInput = json_decode($request->getContent(), true);
        $listBenefit = $arrayInput['listBenefit'];
        $benefitObj = new BenefitsModel();
        if (empty($arrayInput['pharmacy_id'])) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $deletePharmacyBenefits = $benefitObj->DeletePharmacyBenefit($arrayInput['pharmacy_id']);
            $listNewBenefit = array();
            for ($i = 0; $i < count($listBenefit); $i++) {
                if ($listBenefit[$i]['active'] == 1) {
                    array_push($listNewBenefit, array(
                        'pharmacy_id' => $arrayInput['pharmacy_id'],
                        'benefit_id' => $listBenefit[$i]['id']
                    ));
                }
            }
            $insertPharmacyBenefits = $this->pharmacyObj->AddPharmacyBenefit($listNewBenefit);
            if (!empty($insertPharmacyBenefits)) {
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            }
        }
        return json_encode($responseData);
    }

    public function GetPharmacyBenefit($pharmacyId)
    {
        $responseData = new Response;
        $benefitObj = new BenefitsModel();
        $checkPharmacy = $this->pharmacyObj->GetPharmacyById($pharmacyId);
        if (!empty($checkPharmacy)) {
            $benefits = $benefitObj->GetListPharmacyBenefits($pharmacyId);
            if (!empty($benefits)) {
                $responseData->Data = $benefits;
            } else {
                $responseData->Data = array();
            }
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_PHARMACY_NOTFOUND;
        }
        return json_encode($responseData);
    }
}
