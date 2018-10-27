<?php

namespace App\Http\Controllers;

require_once base_path('vendor/autoload.php');
use App\Constants\Constants;
use App\Models\TimeTrackingModel;
use Illuminate\Http\Request;
use App\Models\Response;
use App\Http\Controllers\Controller;
use App\Models\UserModel;
use App\Models\PatientCaptureModel;
use App\Models\RewardModel;
use App\Models\HcfModel;
use App\Models\PharmacyModel;
use App\Common\SendMailService;
use Twilio\Rest\Client;
use Mail;
use Session;
use Carbon\Carbon;
use ImagickDraw;
use Imagick;
use ImagickPixel;
use DB;
use DateTime;
use App;
use Validator;
session_start();

class UserController extends Controller
{
    public $userObj;

    public function __construct()
    {
        $this->userObj = new UserModel();
        $this->hcfObj = new HcfModel();
    }

    public function Login(Request $request)
    {
        $responseData = new Response();
        $user = $this->userObj->GetUser($request->input('email'), $request->input('password'));
        if (!empty($user)) {
            $user->login_token = md5($user->full_name) . $user->id . time();
            $addToken = $this->userObj->AddToken($user->id, $user->login_token);
            $_SESSION[Constants::SESSION_KEY_USER] = $user;
            $listHcfLocation = $this->hcfObj->GetListHcfLocation($user->health_care_facility_id);
            if (!empty($listHcfLocation)) {
                $user->listHcfLocation = $listHcfLocation;
            } else {
                $user->listHcfLocation = array();
            }
            $responseData->Data = $user;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_USER;
        }
        return json_encode($responseData);
    }

    public function GetUserDetails()
    {
        $responseData = new Response;
        $sessionUser = $_SESSION[Constants::SESSION_KEY_USER];
        $userId = $sessionUser->id;
        $user = $this->userObj->GetUserDetails($userId);
        if (!empty($user)) {
            $rewardObj = new RewardModel();
            $avatarDetails = $rewardObj->GetRewardById($user->avatar);
            $avatarUrl = Constants::IMAGES_URL . $avatarDetails->url;
            $backgroundDetails = $rewardObj->GetRewardById($user->background);
            $backgroundUrl = Constants::IMAGES_URL . $backgroundDetails->url;
            $patientCaptureObj = new PatientCaptureModel();
            $surveyDay = $patientCaptureObj->GetTotalDayPoint($userId);
            $surveyMonth = $patientCaptureObj->GetTotalMonthPoint($userId);
            $totalDayPatient = $patientCaptureObj->GetTotalDayPatient($userId);
            $totalMonthPatient = $patientCaptureObj->GetTotalMonthTotalPatient($userId);
            $listTotalMonthPatient = $patientCaptureObj->GetListTotalMonthPatient($userId);
            $listNotContracted = $patientCaptureObj->GetListNotContracted($userId);
            $listSwitched = $patientCaptureObj->GetListSwitched($userId);
            $listTotalMonthPatientSaving = $patientCaptureObj->GetListTotalMonthPatientSaving($userId);
            $user->avatarUrl = $avatarUrl;
            $user->backgroundUrl = $backgroundUrl;
            $user->day_point = (int)$surveyDay;
            $user->month_point = (int)$surveyMonth;
            $user->totalDayPatient = (int)$totalDayPatient;
            $user->totalMonthPatient = (int)$totalMonthPatient;
            $user->listTotalPatientPerMonth = $listTotalMonthPatient;
            $user->listNotContracted = $listNotContracted;
            $user->listSwitched = $listSwitched;
            $user->listTotalMonthPatientSaving = $listTotalMonthPatientSaving;
            $responseData->Data = $user;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_STATUS_USER_NOTFOUND;
        }
        return json_encode($responseData);
    }

    public function ChangePassword(Request $request)
    {

        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if (!empty($user)) {
            $checkUser = $this->userObj->CheckUserPassword($user->id, $request->input('password'));
            if (!empty($checkUser)) {
                if (strlen($request->newpassword) < 6) {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    $responseData->Message = Constants::RESPONSE_MESSAGE_PASSWORD_NOT_ENOUGH_LENGTH;
                } else {
                    $updatePassword = $this->userObj->ChangePassword($user->id, $request->input('newpassword'));
                    $responseData->Data = $updatePassword;
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                }
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_PASSWORD;
            }
        }
        return json_encode($responseData);
    }

    public function Logout()
    {
        $responseData = new Response;
        session_unset();
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        return json_encode($responseData);
    }

    public function ChangeAvatar(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $rewardObj = new RewardModel();
        $checkAvatar = $rewardObj->GetRewardById($request->avatar_id);
        if (empty($checkAvatar)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_REWARD_NOTFOUND;
        } else {
            $checkOwnedAvatar = $rewardObj->CheckUserReward($user->id, $request->avatar_id);
            if (empty($checkOwnedAvatar)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_REWARD_NOTOWNED;
            } else {
                $userDetails = $this->userObj->GetUserDetails($user->id);
                $changeAvatar = $this->userObj->ChangeAvatar($user->id, $request->avatar_id);
                if (!empty($changeAvatar)) {
                    $addTimesChangedAvatar = $this->userObj->AddTimesChangedAvatar($user->id, $userDetails->times_changed_avatar + 1);
                }
                $responseData->Data = $changeAvatar;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            }
        }
        return json_encode($responseData);
    }

    public function ChangeBackground(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $rewardObj = new RewardModel();
        $checkBackground = $rewardObj->GetRewardById($request->background_id);
        if (empty($checkBackground)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_REWARD_NOTFOUND;
        } else {
            $checkOwnedBackground = $rewardObj->CheckUserReward($user->id, $request->background_id);
            if (empty($checkOwnedBackground)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_REWARD_NOTOWNED;
            } else {
                $userDetails = $this->userObj->GetUserDetails($user->id);
                $changeBackground = $this->userObj->ChangeBackground($user->id, $request->background_id);
                if (!empty($changeBackground)) {
                    $addTimesChangedBackground = $this->userObj->AddTimesChangedBackground($user->id, $userDetails->times_changed_background + 1);
                }
                $responseData->Data = $changeBackground;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            }
        }
        return json_encode($responseData);
    }

    public function ForgotPassword(Request $request)
    {
        $responseData = new Response;
        $email = $request->email;
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $user = $this->userObj->GetUserByEmail($email);
            if (!empty($user)) {
                $token = md5(time()) . $user->id;
                $url = Constants::DESTINATION_LINK . $token;
                $updateToken = $this->userObj->UpdatePasswordToken($user->id, $token);
                $sendMail = Mail::send('emails.forgotpassword', ['email' => $user, 'url' => $url, 'myEmail' => Constants::MY_EMAIL], function ($m) use ($user) {
                    $m->from(Constants::FROM_EMAIL, 'Doc & I');
                    $m->to($user->email, $user->full_name)->subject('Reset Password!');
                });
                $responseData->Data = $sendMail;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_EMAIL_NOTFOUND;
            }
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_EMAIL_FORMAT;
        }
        return json_encode($responseData);
    }

    public function ResetPassword(Request $request)
    {
        $responseData = new Response;
        $token = $request->input('token');
        $userId = substr($token, 32);
        $checkUser = $this->userObj->GetUserById($userId);
        if (!empty($checkUser)) {
            if ($token == $checkUser->reset_password_token) {
                $updatePassword = $this->userObj->UpdatePassword($checkUser->id, $request->password);
                if (!empty($updatePassword)) {
                    $deletePasswordToken = $this->userObj->DeletePasswordToken($checkUser->id);
                    $responseData->Data = $updatePassword;
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                }
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_LINK_WAS_BE_USED;
            }
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_USER_NOTFOUND;
        }
        return json_encode($responseData);
    }

    public function InviteUser(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $hcfObj = new HcfModel();
        $rewardObj = new RewardModel();
        $hospitalDetails = $hcfObj->GetHcfDetails($user->health_care_facility_id);
        if (empty($request->full_name) || empty($request->email) || !isset($request->role)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $checkUser = $this->userObj->GetUserByEmail(trim($request->email));
            if (!empty($checkUser)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_EMAIL_EXISTED;
            } else {
                if ($request->role != Constants::USER && $request->role != Constants::ADMIN) {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
                } else {
                    $password = Constants::DEFAULT_PASSWORD;
                    if(empty($request->hcf_id)) {
                        $listRequest = array(
                            'full_name' => $request->full_name,
                            'encrypted_password' => md5($password),
                            'email' => $request->email,
                            'avatar' => Constants::DEFAULT_AVATAR,
                            'background' => Constants::DEFAULT_BACKGROUND,
                            'health_care_facility_id' => $user->health_care_facility_id,
                            'invited_by_id' => $user->id,
                            'role' => $request->role,
                            'invited_at' => Carbon::now(),
                            'token' => Constants::DEFAULT_TOKEN,
                        );
                    } else {
                        $listRequest = array(
                            'full_name' => $request->full_name,
                            'encrypted_password' => md5($password),
                            'email' => $request->email,
                            'avatar' => Constants::DEFAULT_AVATAR,
                            'background' => Constants::DEFAULT_BACKGROUND,
                            'health_care_facility_id' => $request->hcf_id,
                            'invited_by_id' => $user->id,
                            'role' => $request->role,
                            'invited_at' => Carbon::now(),
                            'token' => Constants::DEFAULT_TOKEN,
                        );
                    }
                    $addUser = $this->userObj->AddUser($listRequest);
                    $addUserAvatar = $rewardObj->AddUserReward($addUser, Constants::DEFAULT_AVATAR);
                    $addUserBackground = $rewardObj->AddUserReward($addUser, Constants::DEFAULT_BACKGROUND);
                    if (!empty($addUser) && !empty($addUserAvatar) && !empty($addUserBackground)) {
                        $url = Constants::LOGIN_PAGE_LINK . $request->email;
                        $sendMail = Mail::send('emails.inviteMember', ['full_name' => $request->full_name, 'hospital' => $hospitalDetails->name, 'url' => $url, 'password' => $password], function ($m) use ($request) {
                            $m->from(Constants::FROM_EMAIL, 'Doc & I');
                            $m->to($request->email, $request->full_name)->subject('Account Invitation!');
                        });
                        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                        $responseData->Data = $addUser;
                    } else {
                        $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    }
                }
            }
        }
        return json_encode($responseData);
    }

    public function SwitchUser(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if ($user->role == Constants::ADMIN) {
            $responseData->Status = Constants::RESPONSE_STATUS_ACCESS_IS_DENIED;
        } else {
            if (empty($request->login_token) || empty($request->userId)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
            } else {
                $checkUser = $this->userObj->CheckUserLoginToken($request->userId, $request->login_token);
                if (empty($checkUser)) {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    $responseData->Message = Constants::RESPONSE_STATUS_USER_NOTFOUND;
                } else {
                    $_SESSION = array();
                    $_SESSION[Constants::SESSION_KEY_USER] = $checkUser;
                    $responseData->Data = $checkUser;
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                }
            }
        }
        return json_encode($responseData);
    }

    public function GetHcfUser()
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $listUser = $this->userObj->GetHcfUser($user->health_care_facility_id);
        if (!empty($listUser)) {
            $responseData->Data = $listUser;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
        }
        return json_encode($responseData);
    }

    public function GetAllUserByHcf(Request $request)
    {
        $responseData = new Response;
        $listUser = $this->userObj->GetHcfUser($request->hcfId);
        if (!empty($listUser)) {
            $responseData->Data = $listUser;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
        }
        return json_encode($responseData);
    }

    public function ChangeTextCard($hcfId, $patientName)
    {
        header('Content-type: image/jpg');
        $hcfObj = new HcfModel();
        $discountCardInfo = $hcfObj->GetHcfById($hcfId);
        $draw = new ImagickDraw();
        $pixel = new ImagickPixel('gray');
        $handle = fopen(public_path(Constants::DIS_COUNT_CARD_URL) . '/' . 'discount_card_fullsize.jpg', 'rb');
        $img = new Imagick();
        $img->readImageFile($handle);
        $draw->setFontSize(35);
        $img->annotateImage($draw, 285, 1070, 0, strtoupper($discountCardInfo->rxgrp));
        $img->annotateImage($draw, 285, 1163, 0, strtoupper($discountCardInfo->input_code));
        $img->annotateImage($draw, 285, 1256, 0, strtoupper($patientName));
        $overlay = new Imagick(public_path('images') . '/' . $discountCardInfo->discount_card_image_url);
        $overlay->resizeImage(0, 121, imagick::FILTER_LANCZOS, 1);
        $img->compositeImage($overlay, Imagick::COMPOSITE_DEFAULT, 35, 750);
        $img_name = time() . 'discount_card_fullsize.jpg';
        $img->writeImageFile(fopen(public_path(Constants::DIS_COUNT_CARD_MODIFIED_URL) . '/' . $img_name, "wb"));
        $path = Constants::IMAGE_SMS_LINK . $img_name;
        return $path;
    }

    public function SendSms(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if (!isset($request->phone_number) || !isset($request->include_pharmacy_info) || !isset($request->send_discount_card) || !isset($request->pharmacy_id)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $sid = Constants::TEST_ACCOUNT_SID;
            $token = Constants::TEST_AUTHTOKEN;
            $client = new Client($sid, $token);
            if($request->include_pharmacy_info == true) {
                $pharmacyObj = new PharmacyModel();
                $pharmacyInfo = $pharmacyObj->GetPharmacyById($request->pharmacy_id);
                if($request->send_discount_card == true) {
                    $path = $this->ChangeTextCard($user->health_care_facility_id,$request->name);
                    $sms = $client->account->messages->create(
                        $request->phone_number,
                        array(
                            'from' => Constants::SEND_SMS_PHONE_NUMBER,
                            'body' => "Thank you for using Doc & I. Please present this card to the pharmacist when picking up your prescription
                                       This is the pharmarcy info you have chosen:
                                       Pharmacy name: $pharmacyInfo->name,
                                       Pharmacy address: $pharmacyInfo->address - $pharmacyInfo->city ",
                            'mediaUrl' => $path,
                        )
                    );
                } else {
                    $sms = $client->account->messages->create(
                        $request->phone_number,
                        array(
                            'from' => Constants::SEND_SMS_PHONE_NUMBER,
                            'body' => "Pharmacy name: $pharmacyInfo->name,
                                       Pharmacy address: $pharmacyInfo->address - $pharmacyInfo->city ",
                        )
                    );
                }
            } else {
                $path = $this->ChangeTextCard($user->health_care_facility_id,$request->name);
                $sms = $client->account->messages->create(
                    $request->phone_number,
                    array(
                        'from' => Constants::SEND_SMS_PHONE_NUMBER,
                        'body' => "Thank you for using Doc & I. Please present this card to the pharmacist when picking up your prescription",
                        'mediaUrl' => $path,
                    )
                );
            }

            if (!$sms) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            } else {
                $responseData->Data = $sms->sid;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            }
        }
        return json_encode($responseData);
    }

    public function RemoveMember(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if ($user->role == Constants::SUPER_ADMIN) {
            $checkUserInHcf = $this->userObj->CheckUserInHcf($request->userId);
        } else {
            $checkUserInHcf = $this->userObj->CheckMemberInHcf($request->userId, $user->health_care_facility_id);
        }
        if (!empty($checkUserInHcf)) {
            $removeMember = $this->userObj->RemoveMember($request->userId);
            if (!empty($removeMember)) {
                $rewardObj = new RewardModel();
                $removeReward = $rewardObj->RemoveUserReward($request->userId);
                $responseData->Data = $request->userId;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            }
        } else {
            $responseData->Message = Constants::RESPONSE_MESSAGE_USER_NOTFOUND;
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
        }
        return json_encode($responseData);
    }

    public function SavingCard(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData->Data = Constants::IMAGES_URL . Constants::SAVING_CART_MODIFIED . '/1_saving_cart_english.png';
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        return json_encode($responseData);
    }

    public function EmailSavingCard(Request $request)
    {
        $responseData = new Response;
        if (!$request->email) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            if ($request->language == 'spanish') {
                $path1 = "http://docandi.com/images/saving_card_modified/frontside_savingcard_spanish.png";
                $path2 = "http://docandi.com/images/saving_card_modified/backside_savingcard_spanish.png";
            } else {
                $path1 = "http://docandi.com/images/saving_card_modified/frontside_savingcard_english.png";
                $path2 = "http://docandi.com/images/saving_card_modified/backside_savingcard_english.png";
            }
            $sendMail = Mail::send('emails.savingcard', [], function ($m) use ($request, $path1, $path2) {
                $m->from(Constants::FROM_EMAIL, 'Doc & I');
                $m->to($request->email);
                $m->subject('Saving Card!');
                $m->attach($path1);
                $m->attach($path2);
            });
            if (!$sendMail) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            }
        }
        return json_encode($responseData);
    }

    public function ChangeEmailCard($hcfId,$patientName)
    {
        header('Content-type: image/jpg');
        $hcfObj = new HcfModel();
        $discountCardInfo = $hcfObj->GetHcfById($hcfId);
        $draw = new ImagickDraw();
        $pixel = new ImagickPixel('gray');
        $handle = fopen(public_path(Constants::DIS_COUNT_CARD_URL) . '/' . 'discount_card.jpg', 'rb');
        $img = new Imagick();
        $img->readImageFile($handle);
        $draw->setFontSize(15);
        $img->annotateImage($draw, 135, 180, 0, strtoupper($discountCardInfo->rxgrp));
        $img->annotateImage($draw, 135, 220, 0, strtoupper($discountCardInfo->input_code));
        $img->annotateImage($draw, 135, 263, 0, strtoupper($patientName));
        //$img->annotateImage($draw, 135, 263, 0, strtoupper($request->name));
        $overlay = new Imagick(public_path('images') . '/' . $discountCardInfo->discount_card_image_url);
        $overlay->resizeImage(0, 56, imagick::FILTER_LANCZOS, 1);
        $img->compositeImage($overlay, Imagick::COMPOSITE_DEFAULT, 23, 35);
        $img_name = time() . 'discount_card.jpg';
        $img->writeImageFile(fopen(public_path(Constants::DIS_COUNT_CARD_MODIFIED_URL) . '/' . $img_name, "wb"));
        $path = public_path(Constants::DIS_COUNT_CARD_MODIFIED_URL . '/' . $img_name);
        return $path;
    }

    public function EmailDiscountCard(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if (!isset($request->email) || !isset($request->include_pharmacy_info) || !isset($request->send_discount_card) || !isset($request->pharmacy_id)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            date_default_timezone_set("America/Chicago");
            $time = Carbon::now();
            $docaniLogoUrl = Constants::IMAGES_URL . '/docandi/docandi_logo.PNG';
            if($request->include_pharmacy_info == true) {
                $pharmacyObj = new PharmacyModel();
                $pharmacyInfo = $pharmacyObj->GetPharmacyById($request->pharmacy_id);
                if($request->send_discount_card == true) {
                    $path1 = $this->ChangeEmailCard($user->health_care_facility_id,$request->name);
                    $path2 = public_path(Constants::DIS_COUNT_CARD_URL . '/' . 'discount_card_backside.jpg');
                    $sendMail = Mail::send('emails.discount', ['name' => $request->name, 'docaniLogoUrl' => $docaniLogoUrl, 'time' => $time,'pharmacyName' => $pharmacyInfo->name,'pharmacyAddress' => $pharmacyInfo->address,'city' => $pharmacyInfo->city], function ($m) use ($request, $path1, $path2) {
                        $m->from(Constants::FROM_EMAIL, 'Doc & I');
                        $m->to($request->email);
                        $m->subject('Doc & I Discount Card');
                        $m->attach($path1);
                        $m->attach($path2);
                    });
                } else {
                    $sendMail = Mail::send('emails.discount', ['docaniLogoUrl' => $docaniLogoUrl, 'time' => $time,'pharmacyName' => $pharmacyInfo->name,'pharmacyAddress' => $pharmacyInfo->address,'city' => $pharmacyInfo->city], function ($m) use ($request) {
                        $m->from(Constants::FROM_EMAIL, 'Doc & I');
                        $m->to($request->email);
                        $m->subject('Doc & I Discount Card');
                    });
                }
            } else {
                $path1 = $this->ChangeEmailCard($user->health_care_facility_id,$request->name);
                $path2 = public_path(Constants::DIS_COUNT_CARD_URL . '/' . 'discount_card_backside.jpg');
                $sendMail = Mail::send('emails.discount', ['name' => $request->name, 'docaniLogoUrl' => $docaniLogoUrl, 'time' => $time], function ($m) use ($request, $path1, $path2) {
                    $m->from(Constants::FROM_EMAIL, 'Doc & I');
                    $m->to($request->email);
                    $m->subject('Doc & I Discount Card');
                    $m->attach($path1);
                    $m->attach($path2);
                });
            }
            if (!$sendMail) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            }
        }
        return json_encode($responseData);
    }

    public function SetLastUsingTime(Request $request)
    {
        $responseData = new Response;
        if (!isset($request->hcf_location_id) || !isset($request->time_zone)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $user = $_SESSION[Constants::SESSION_KEY_USER];
            $offsetTime = (string)$request->time_zone . " hours";
            $today = strtotime(date("Y-m-d H:i:s", strtotime(Carbon::now())) . $offsetTime);
            $today_full_format = strftime("%Y-%m-%d %H:%M:%S", $today);
            $today_date_format = strftime("%Y-%m-%d", $today);
            $now = strftime("%H", $today);
            $lastUsingTime = $this->userObj->GetLastUsingTime($user->id)->last_using_time;
            $lastUsingTime = strftime("%Y-%m-%d", strtotime($lastUsingTime));
            if ($today_date_format != $lastUsingTime) {
                $dayActive = $this->userObj->GetDayActive($user->id)->day_active;
                $dayActive += 1;
                $addDayActive = $this->userObj->AddDayActive($user->id, $dayActive);
            }
            $setUsingTime = $this->userObj->SetLastUsingTime($user->id, $request->hcf_location_id, $today_full_format);
            if (!empty($setUsingTime)) {
                $checkTimeOnline = 0;
                $timeTrackingObj = new TimeTrackingModel();
                $checkDateOnline = $timeTrackingObj->GetOnlineDate($today_date_format, $user->id);
                if (!empty($checkDateOnline)) {
                    $data = $checkDateOnline->time_online;
                    $data = (json_decode($data));
                    for ($i = 0; $i < count($data); $i++) {
                        if ($data[$i] == $now) {
                            $checkTimeOnline = 1;
                            break;
                        }
                    }
                    if ($checkTimeOnline == 0) {
                        array_push($data, $now);
                        $data = json_encode($data);
                        $updateOnlineTime = $timeTrackingObj->UpdateOnlineTime($user->id, $today_date_format, $data);
                    }
                } else {
                    $timeOnline = array();
                    array_push($timeOnline, $now);
                    $timeOnline_encode = json_encode($timeOnline);
                    $list = array(
                        "user_id" => $user->id,
                        "date_online" => $today_date_format,
                        "time_online" => $timeOnline_encode
                    );
                    $addOnlineTime = $timeTrackingObj->AddOnlineTime($list);
                }
                $responseData->Data = $setUsingTime;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            } else {
                $responseData->Data = Constants::RESPONSE_STATUS_ERROR;
            }
        }
        return json_encode($responseData);
    }

    public function UserPatientDetails(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $offsetTime = (string)$request->time_zone . " hours";
        $time = strtotime(date("Y-m-d H:i:s", strtotime(Carbon::now())) . $offsetTime);
        $allUser = $this->userObj->GetAllUser($user->health_care_facility_id);
        for ($i = 0; $i < count($allUser); $i++) {
            if (($time - strtotime($allUser[$i]->last_using_time)) < Constants::CHECK_ONLINE_TIME) {
                if ($allUser[$i]->online_status == 0) {
                    $allUser[$i]->online_status = 1;
                    $statusId = 1;
                    $updateUserStatus = $this->userObj->UpdateUserStatus($allUser[$i]->id, $statusId);
                }
            } else {
                if ($allUser[$i]->online_status == 1) {
                    $allUser[$i]->online_status = 0;
                    $statusId = 0;
                    $updateUserStatus = $this->userObj->UpdateUserStatus($allUser[$i]->id, $statusId);
                }
            }
        }
        if (!isset($request->location_id) || !isset($request->date_start) || !isset($request->date_end) || !isset($request->time_zone)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $date_start = $request->date_start;
            $date_end = $request->date_end;
            $date_end = strtotime(date("Y-m-d", strtotime($date_end)) . " +1 day");
            $date_end = strftime("%Y-%m-%d", $date_end);
            $location_id = $request->location_id;
            $allUser = $this->userObj->UserPatient($date_end, $date_start, $location_id, $user->health_care_facility_id);
            if (!empty($allUser)) {
                $responseData->Data = $allUser;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            } else {
                $responseData->Data = array();
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            }
        }
        return json_encode($responseData);
    }

    public function GetOverViewVideo()
    {
        $responseData = new Response;
        $responseData->Data = Constants::OVERVIEW_VIDEO_URL;
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        return json_encode($responseData);
    }

    public function SignUpMail(Request $request)
    {
        $responseData = new Response;
        if (!isset($request->name) || !isset($request->email) || !isset($request->message)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $message = (string)$request->message;
            $sendMail = Mail::send('emails.signup_mail', ['name' => $request->name, 'email' => $request->email, 'mess' => $message], function ($m) {
                $m->from(Constants::FROM_EMAIL, 'Doc & I');
                $m->to(Constants::MY_EMAIL);
                $m->subject('Doc & I ');
            });
            if (!empty($sendMail)) {
                $responseData->Data = $sendMail;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            }
        }
        return json_encode($responseData);
    }

    public function ChangeRole(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        if (!isset($request->user_id) || !isset($request->role)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $checkUser = $this->userObj->GetUserById($request->user_id);
            if (empty($user)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_USER;
            } else {
                $changeRole = $this->userObj->ChangeRole($checkUser->id, $request->role);
                if (empty($changeRole)) {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                } else {
                    $responseData->Data = $changeRole;
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                }
            }
        }
        return json_encode($responseData);
    }

    public function UpdateMember(Request $request)
    {
        $responseData = new Response;
        if (!isset($request->id) || !isset($request->email) || !isset($request->full_name) || !isset($request->role)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $email = trim($request->email);
            if ($request->role == Constants::SUPER_ADMIN) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
            } else {
                $checkUser = $this->userObj->GetUserById($request->id);
                if (empty($checkUser)) {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    $responseData->Message = Constants::RESPONSE_MESSAGE_USER_NOTFOUND;
                } else {
                    $checkEmail = $this->userObj->CheckUserEmail($email, $request->id);
                    if (!empty($checkEmail)) {
                        $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                        $responseData->Message = Constants::RESPONSE_MESSAGE_EMAIL_EXISTED;
                    } else {
                        if ($checkUser->role == Constants::SUPER_ADMIN) {
                            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                            $responseData->Message = Constants::RESPONSE_STATUS_ACCESS_IS_DENIED;
                        } else {
                            if($request->role == Constants::HOSPITAL_ADMIN) {
                                $hospitalAdmin = $this->userObj->GetHospitalAdmin($checkUser->health_care_facility_id);
                                if(!empty($hospitalAdmin)) {
                                    $changeRole = $this->userObj->ChangeRole($hospitalAdmin->id,Constants::ADMIN);
                                }
                            }
                            $listRequest = array(
                                'email' => $email,
                                'full_name' => $request->full_name,
                                'role' => $request->role,
                            );
                            $updateMember = $this->userObj->UpdateUserDetail($request->id, $listRequest);
                            $responseData->Data = $updateMember;
                            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                        }
                    }
                }
            }
        }
        return json_encode($responseData);
    }

    public function LoginAdmin(Request $request)
    {
        $responseData = new Response;
        if (!isset($request->email) || !isset($request->password)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $email = $request->email;
            $password = $request->password;
            $checkUser = $this->userObj->GetUser($email, $password);
            if (!empty($checkUser)) {
                if ($checkUser->role == Constants::SUPER_ADMIN) {
                    $checkUser->login_token = md5($checkUser->full_name) . $checkUser->id . time();
                    $addToken = $this->userObj->AddToken($checkUser->id, $checkUser->login_token);
                    $_SESSION[Constants::SESSION_KEY_USER] = $checkUser;
                    $responseData->Data = $checkUser;
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    $responseData->Message = Constants::RESPONSE_STATUS_ACCESS_IS_DENIED;
                }
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_USER;
            }
        }
        return json_encode($responseData);
    }

    public function InviteMember(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $hcfObj = new HcfModel();
        $rewardObj = new RewardModel();
        $hospitalDetails = $hcfObj->GetHcfDetails($request->hcf_id);
        if (empty($request->full_name) || empty($request->email) || !isset($request->role) || !isset($request->hcf_id)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $checkUser = $this->userObj->GetUserByEmail(trim($request->email));
            if (!empty($checkUser)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_EMAIL_EXISTED;
            } else {
                if ($request->role != Constants::USER && $request->role != Constants::ADMIN) {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
                } else {
                    $password = str_random(8);
                    $listRequest = array(
                        'full_name' => $request->full_name,
                        'encrypted_password' => md5($password),
                        'email' => $request->email,
                        'avatar' => Constants::DEFAULT_AVATAR,
                        'background' => Constants::DEFAULT_BACKGROUND,
                        'health_care_facility_id' => $request->hcf_id,
                        'invited_by_id' => $user->id,
                        'role' => $request->role,
                        'invited_at' => Carbon::now(),
                        'token' => Constants::DEFAULT_TOKEN,
                    );
                    $addUser = $this->userObj->AddUser($listRequest);
                    $addUserAvatar = $rewardObj->AddUserReward($addUser, Constants::DEFAULT_AVATAR);
                    $addUserBackground = $rewardObj->AddUserReward($addUser, Constants::DEFAULT_BACKGROUND);
                    if (!empty($addUser) && !empty($addUserAvatar) && !empty($addUserBackground)) {
                        $url = Constants::LOGIN_PAGE_LINK . $request->email;
                        $sendMail = Mail::send('emails.inviteMember', ['full_name' => $request->full_name, 'hospital' => $hospitalDetails->name, 'url' => $url, 'password' => $password], function ($m) use ($request) {
                            $m->from(Constants::FROM_EMAIL, 'Doc & I');
                            $m->to($request->email, $request->full_name)->subject('Account Invitation!');
                        });
                        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                        $responseData->Data = $addUser;
                    } else {
                        $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    }
                }
            }
        }
        return json_encode($responseData);
    }

    public function RewardToken(Request $request)
    {
        $responseData = new Response;
        if(!isset($request->user_id) || !isset($request->token)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $checkUser = $this->userObj->GetUserById($request->user_id);
            if(empty($checkUser)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_USER_NOTFOUND;
            } else {
                $checkUser->token += $request->token;
                $addToken = $this->userObj->RewardToken($request->user_id,$checkUser->token);
                if(!empty($addToken)) {
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                    $responseData->Data = $addToken;
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                }
            }
        }
        return json_encode($responseData);
    }

    public function UserWeeklyReport()
    {
        $responseData = new Response();
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $now = Carbon::now();
        $week =date("W", strtotime($now));
        if($user->role == Constants::USER) {
            $progressReport = $this->userObj->UserWeeklyReport($user->id,$week);
            if(empty($progressReport)) {
                $responseData->Data = array();
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            } else {
                $progressReport->dateStart = date("Y-m-d",strtotime('monday this week'));
                $progressReport->dateEnd = date("Y-m-d",strtotime('friday this week'));
                $progressReport->patientToGoal = $user->patient_goal - $progressReport->patientNumber;
                $progressReport->patientSaving *= 62;
                $responseData->Data = $progressReport;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            }
        } else {
            $progressReport = $this->userObj->AdminWeeklyReport($user->health_care_facility_id,$week);
            $progressReport->dateStart = date("Y-m-d",strtotime('monday this week'));
            $progressReport->dateEnd = date("Y-m-d",strtotime('friday this week'));
            $team_goal = $this->userObj->GetTeamGoal($user->health_care_facility_id);
            $progressReport->patientToGoal = $team_goal - $progressReport->patientNumber;
            $progressReport->topPerformers = $this->userObj->TopWeeklyUser($user->health_care_facility_id,$week);
            $progressReport->topImprovement = $this->userObj->TopWeeklyImprovement($user->health_care_facility_id,$week);
            $responseData->Data = $progressReport;
			$responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        }
        return json_encode($responseData);
    }

    public function AddGoal(Request $request)
    {
        $responseData = new Response();
        if(empty($request->user_id) || empty($request->goal)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
        } else {
            $checkUser = $this->userObj->GetUserById($request->user_id);
            if(empty($checkUser)) {
                $responseData->Message = Constants::RESPONSE_MESSAGE_USER_NOTFOUND;
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            } else {
                $addGoal = $this->userObj->AddGoal($request->user_id,$request->goal);
                if(empty($addGoal)) {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                } else {
                    $responseData->Data = $addGoal;
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                }
            }
        }
        return json_encode($responseData);
    }

    public function CompleteTutorial () {
        $responseData = new Response();
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $completeTutorial = $this->userObj->CompleteTutorial($user->id);
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        return json_encode($responseData);
    }


}
