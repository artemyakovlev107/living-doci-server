<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Constants\Constants;
use Carbon\Carbon;


class RewardModel extends Model
{
    public function GetListRewardCategory()
    {
    	return DB::table('reward_category')->get();
    }

    public function GetListUserAvatar($userId)
    {
    	return DB::table('user_reward')
                ->select(DB::raw('user_reward.*,reward.*,Concat("'.Constants::IMAGES_URL.'",reward.url) as url'))
                ->join('reward','user_reward.reward_id','=','reward.id')
                ->where('user_reward.user_id',$userId)
                ->where('reward_type',Constants::AVATAR)
                ->get();
    }

    public function GetListAvatarByCategoryId($categoryId)
    {
    	return DB::table('reward')->where('reward_type',Constants::AVATAR)->where('reward_category_id',$categoryId)->get();
    }

    public function CheckUserReward($userId,$rewardId)
    {
    	return DB::table('user_reward')->where('user_id',$userId)->where('reward_id',$rewardId)->first();
    }

    public function GetAllAvatar()
    {
        return DB::table('reward')
                ->select(DB::raw('reward.id,reward.name,reward.reward_category_id,reward.reward_type,reward.cost,Concat("'.Constants::IMAGES_URL.'",reward.url) as url'))
                ->where('reward_type',Constants::AVATAR)
                ->get();
    }

    public function GetRewardById($id)
    {
        return DB::table('reward')->find($id);
    }

    public function AddUserReward($userId,$rewardId)
    {
        return DB::table('user_reward')->insert([
                'user_id' => $userId,
                'reward_id' => $rewardId,
                'created_at' => Carbon::now(),
                'status' => 1
            ]);
    }

    public function GetAllBackground()
    {
        return DB::table('reward')
                ->select(DB::raw('reward.id,reward.name,reward.reward_category_id,reward.reward_type,reward.cost,Concat("'.Constants::IMAGES_URL.'",reward.url) as url'))
                ->where('reward_type',Constants::BACKGROUND)
                ->get();
    }

    public function GetListUserBackground($userId)
    {
        return DB::table('user_reward')
                ->select(DB::raw('user_reward.*,reward.*,Concat("'.Constants::IMAGES_URL.'",reward.url) as url'))
                ->join('reward','reward.id','=','user_reward.reward_id')
                ->where('reward.reward_type',Constants::BACKGROUND)
                ->where('user_reward.user_id',$userId)
                ->get();
    }
    public function RemoveUserReward($userId)
    {
        return DB::table('user_reward')->where('user_id',$userId)->delete();
    }

    public function GetTokenRedeem($hcfId)
    {
        return DB::table('user_reward')->join('reward','reward.id','=','user_reward.reward_id')->join('user','user.id','=','user_reward.user_id')->where('user.health_care_facility_id',$hcfId)->whereNotIn('user_reward.reward_id',[Constants::DEFAULT_AVATAR,Constants::DEFAULT_BACKGROUND])->sum('reward.cost');
    }
}
