<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class TimeTrackingModel extends Model
{
    public function GetOnlineDate($date,$userId)
    {
        return DB::table('user_online_time_tracking')->where('date_online',$date)->where('user_id',$userId)->first();
    }

    public function AddOnlineTime($listRequest)
    {
        return DB::table('user_online_time_tracking')->insertGetId($listRequest);
    }
    public function UpdateOnlineTime($userId,$date,$time)
    {
        return DB::table('user_online_time_tracking')->where('user_id',$userId)->where('date_online',$date)->update([
            "time_online" => $time
        ]);
    }

    public function GetNumberOfOnlineUsers($dateStart,$dateEnd,$hcfId)
    {
        return DB::table('user_online_time_tracking')
                    ->select('user_online_time_tracking.*')
                    ->join('user','user_online_time_tracking.user_id','=','user.id')
                    ->whereBetween('date_online',array($dateStart,$dateEnd))
                    ->where('user.health_care_facility_id',$hcfId)
                    ->get();

    }
}
