<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Constants\Constants;
use App\Models\RewardModel;
use App\Models\Response;
use App\Models\UserModel;
use Session;

session_start();

class RewardController extends Controller
{
	public $rewardObj;

    public function __construct()
    {
        $this->rewardObj = new RewardModel();
    }
    public function GetListRewardCategory()
    {
    	$responseData = new Response;
    	$listRewardCategory = $this->rewardObj->GetListRewardCategory();
        if (!empty($listRewardCategory)) {
            $responseData->Data = $listRewardCategory;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = "";
        }
        return json_encode($responseData);
    }

    public function GetListAvatar(Request $request)
    {
    	$responseData = new Response;
    	$listAvatar = $this->rewardObj->GetListUserAvatar($request->userId);
        if (!empty($listAvatar)) {
            $responseData->Data = $listAvatar;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = "";
        }
        return json_encode($responseData);
    }

    public function GetListAvatarByCategoryId(Request $request)
    {
    	$responseData = new Response;
    	$listAvatar = $this->rewardObj->GetListAvatarByCategoryId($request->input('categoryId'));
        if (!empty($listAvatar)) {
        	foreach ($listAvatar as $key => $value) {
    			$userReward = $this->rewardObj->CheckUserReward($request->input('userId'),$value->id);
    			if(!empty($userReward)) {
    				$value->owned = "1";
    			} else {
    				$value->owned = "0";
    			}
    		}
            $responseData->Data = $listAvatar;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = "";
        }
        return json_encode($responseData);
    }

    public function GetAllAvatar()
    {   
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response;
        $listAvatar = $this->rewardObj->GetAllAvatar();
        if (!empty($listAvatar)) {
            foreach ($listAvatar as $key => $value) {
                $userReward = $this->rewardObj->CheckUserReward($user->id,$value->id);
                if(!empty($userReward)) {
                    $value->owned = "1";
                } else {
                    $value->owned = "0";
                }
            }
            $responseData->Data = $listAvatar;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = "";
        }
        return json_encode($responseData);
    }

    public function ExchangeReward(Request $request)
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $checkUserReward = $this->rewardObj->CheckUserReward($user->id, $request->reward_id);
        if(!empty($checkUserReward)) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = Constants::RESPONSE_MESSAGE_REWARD_IS_OWNED;  
        } else {
            $userObj = new UserModel();
            $userDetails = $userObj->GetUserDetails($user->id);
            $responseData = new Response;
            $rewardDetail = $this->rewardObj->GetRewardById($request->reward_id);
            if($userDetails->token < $rewardDetail->cost) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_NOT_ENOUGH_TOKEN;
            } else {
                $addUserReward = $this->rewardObj->AddUserReward($user->id,$request->reward_id);
                if(!empty($addUserReward)) {
                    $newToken = $userDetails->token - $rewardDetail->cost ;
                    $subtractToken = $userObj->ChangeToken($user->id,$newToken);
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    $responseData->Data = "";
                }
            }
        }
        return json_encode($responseData);
    }

    public function GetAllBackground()
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response;
        $listBackground = $this->rewardObj->GetAllBackground();
        if (!empty($listBackground)) {
            foreach ($listBackground as $key => $value) {
                $userReward = $this->rewardObj->CheckUserReward($user->id,$value->id);
                if(!empty($userReward)) {
                    $value->owned = "1";
                } else {
                    $value->owned = "0";
                }
            }
            $responseData->Data = $listBackground;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Data = "";
        }
        return json_encode($responseData);
    }

    public function GetListUserBackground()
    {
        $responseData = new Response;
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $listBackground = $this->rewardObj->GetListUserBackground($user->id);
        $responseData->Data = $listBackground;
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        return json_encode($responseData);
    }

}
