<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Constants\Constants;
use Carbon\Carbon;
use DateTime;
use DB;

class UserModel extends Model
{
    public function GetUser($email, $password)
    {
        return DB::table('user')->select('id', 'full_name', 'health_care_facility_id', 'role','patient_goal','completed_tutorial')->where('email', $email)->where('encrypted_password', md5($password))->first();
    }

    public function ListAllMember()
    {
        return DB::table('user')->select('id', 'full_name', 'health_care_facility_id', 'role')->where('role',Constants::USER)->orWhere('role',Constants::ADMIN)->get();
    }

    public function GetUserByEmail($email)
    {
        return DB::table('user')->where('email', $email)->first();
    }

    public function CheckUserEmail($email,$userId)
    {
        return DB::table('user')->where('id','<>',$userId)->where('email',$email)->first();
    }

    public function GetUserById($id)
    {
        return DB::table('user')->select(DB::raw('user.*,md5(encrypted_password) as encrypted_password'))->where('id', $id)->first();
    }

    public function CheckUserPassword($id, $password)
    {
        return DB::table('user')->where('id', $id)->where('encrypted_password', md5($password))->first();
    }

    public function CheckUserLoginToken($userId, $loginToken)
    {
        return DB::table('user')->where('id', $userId)->where('login_token', $loginToken)->first();
    }

    public function GetUserDetails($id)
    {
        return DB::table('user')
                ->select('user.*','health_care_facility.name as hospitalName')
                ->join('health_care_facility','health_care_facility.id','=','user.health_care_facility_id')
                ->where('user.id', $id)
                ->first();
    }

    public function ChangePassword($id, $password)
    {
        return DB::table('user')->where('id', $id)->update([
            'encrypted_password' => md5($password)
        ]);
    }

    public function GetTopUser($hcfId)
    {
        return DB::table('user')
            ->select(DB::raw('user.*,Concat("' . Constants::IMAGES_URL . '",reward.url) as avatarUrl,sum(patient_capture.point) as month_point'))
            ->join('reward', 'user.avatar', '=', 'reward.id')
            ->leftjoin('patient_capture', 'patient_capture.user_id', '=', 'user.id')
            ->where('user.health_care_facility_id', $hcfId)
            ->whereMonth('patient_capture.created_at', '=', date('m'))
            ->groupBy('user.id')
            ->orderBy('month_point', 'desc')
            ->take(5)
            ->skip(0)
            ->get();
    }

    public function AddPoint($userId, $point, $totalPatient, $token)
    {
        return DB::table('user')->where('id', $userId)->update([
            'total_point' => $point,
            'total_patient' => $totalPatient,
            'token' => $token
        ]);
    }

    public function ChangeToken($userId, $token)
    {
        return DB::table('user')->where('id', $userId)->update([
            'token' => $token
        ]);
    }

    public function ChangeAvatar($userId, $avatarId)
    {
        return DB::table('user')->where('id', $userId)->update([
            'avatar' => $avatarId
        ]);
    }

    public function ChangeBackground($userId, $backgroundId)
    {
        return DB::table('user')->where('id', $userId)->update([
            'background' => $backgroundId
        ]);
    }

    public function UpdatePasswordToken($userId, $token)
    {
        return DB::table('user')->where('id', $userId)->update([
            'reset_password_token' => $token
        ]);
    }

    public function DeletePasswordToken($userId)
    {
        return DB::table('user')->where('id', $userId)->update([
            'reset_password_token' => ''
        ]);
    }

    public function UpdatePassword($userId, $password)
    {
        return DB::table('user')->where('id', $userId)->update([
            'encrypted_password' => md5($password),
            'reset_password_sent_at' => Carbon::now()
        ]);
    }

    public function UpdateUserDetail($userId,$listRequest)
    {
        return DB::table('user')->where('id',$userId)->update($listRequest);
    }

    public function AddToken($userId, $loginToken)
    {
        return DB::table('user')->where('id', $userId)->update([
            'login_token' => $loginToken
        ]);
    }

    public function RewardToken($userId,$token)
    {
        return DB::table('user')->where('id',$userId)->update([
            'token' => $token
        ]);
    }

    public function AddUser($listRequest)
    {
        return DB::table('user')->insertGetId($listRequest);
    }

    public function GetHcfUser($hcfId)
    {
        return DB::table('user')->select('id', 'full_name', 'email', 'role', 'total_point','token','patient_goal')->where('health_care_facility_id', $hcfId)->where('role','<>',Constants::SUPER_ADMIN)->get();
    }

    public function RemoveMember($userId)
    {
        return DB::table('user')->where('id', $userId)->delete();
    }

    public function CheckUserInHcf($userId)
    {
        return DB::table('user')->where('id',$userId)->first();
    }

    public function CheckMemberInHcf($userId, $hcfId)
    {
        return DB::table('user')->where('id',$userId)->where('health_care_facility_id',$hcfId)->where('role',Constants::USER)->first();
    }

    public function SetLastUsingTime($userId,$locationId,$time)
    {
        return DB::table('user')->where('id',$userId)->update([
                'last_using_time' => $time,
                'last_location_working_id' => $locationId
            ]);
    }
    public function GetLastUsingTime($userId)
    {
        return DB::table('user')->select('last_using_time')->where('id',$userId)->first();
    }

    public function GetDayActive($userId)
    {
        return DB::table('user')->select('day_active')->where('id',$userId)->first();
    }

    public function AddDayActive($userId,$dayActive)
    {
        return DB::table('user')->where('id',$userId)->update([
            "day_active" => $dayActive
        ]);
    }
    public function GetAllUser($hcfId)
    {
        return DB::table('user')->select('id','full_name','last_using_time','online_status')->where('health_care_facility_id',$hcfId)->get();
    }

    public function UpdateUserStatus($userId,$statusId)
    {
        return DB::table('user')->where('id',$userId)->update([
                'online_status' => $statusId
            ]);
    }

    public function UserPatient($dateEnd, $dateStart, $locationId,$hcfId)
    {
        if($locationId == 0) {
            $sql = "AND patient_capture.created_at BETWEEN '$dateStart' AND '$dateEnd' ";
        } else {
            $sql = "AND patient_capture.hcf_location_id =$locationId AND patient_capture.created_at BETWEEN '$dateStart' AND '$dateEnd'";
        }
        return DB::select("SELECT user.*, 
                        (SELECT COUNT(patient_capture.id) FROM patient_capture WHERE patient_capture.user_id = user.id ".$sql.") AS PatientsCapture,
                        (SELECT COUNT(patient_capture.id) FROM patient_capture WHERE patient_capture.status = 1 AND patient_capture.user_id = user.id ".$sql.") AS UsingContracted,
                        (SELECT COUNT(patient_capture.id) FROM patient_capture WHERE patient_capture.status <> 1 AND patient_capture.user_id = user.id ".$sql.") AS NotContracted,
                        (SELECT COUNT(patient_capture.id) FROM patient_capture WHERE patient_capture.status = 2 AND patient_capture.user_id = user.id ".$sql.") AS AgreeToSwitch
                        FROM user
                             JOIN patient_capture ON user.id = patient_capture.user_id
                            WHERE user.health_care_facility_id = $hcfId
                        GROUP BY user.id ");
    }

    public function TimesChangedAvatar($hcfId)
    {
        return DB::table('user')->where('health_care_facility_id',$hcfId)->sum('times_changed_avatar');
    }

    public function AddTimesChangedAvatar($userId,$timeChangedAvatar)
    {
        return DB::table('user')->where('id',$userId)->update([
            "times_changed_avatar" => $timeChangedAvatar
        ]);
    }

    public function TimesChangedBackground($hcfId)
    {
        return DB::table('user')->where('health_care_facility_id',$hcfId)->sum('times_changed_background');
    }
    public function AddTimesChangedBackground($userId,$timeBackground)
    {
        return DB::table('user')->where('id',$userId)->update([
            "times_changed_background" => $timeBackground
        ]);
    }

    public function GetTotalPoint($hcfId)
    {
        return DB::table('user')->where('health_care_facility_id',$hcfId)->sum('total_point');
    }

    public function GetTotalToken($hcfId)
    {
        return DB::table('user')->where('health_care_facility_id',$hcfId)->sum('token');
    }

    public function ChangeRole($userId,$role)
    {
        return DB::table('user')->where('id',$userId)->update([
                'role' => $role
        ]);
    }

    public function DeleteUserByHcf($hcfId)
    {
        return DB::table('user')->where('health_care_facility_id',$hcfId)->delete();
    }

    public function UserWeeklyReport($userId,$week)
    {
        return DB::table('patient_capture')
                    ->select(DB::raw('user.id as userId, user.full_name as userName,user.email as email,
                      COUNT(patient_capture.id) as patientNumber,
                      (select count(patient_capture.id) from patient_capture where patient_capture.status <> 3 and patient_capture.user_id = user.id and WEEKOFYEAR(patient_capture.created_at) = '.$week.') as patientSaving'))
                    ->join('user','user.id','=','patient_capture.user_id')
                    ->where('user.id',$userId)
                    ->whereRaw('WEEKOFYEAR(patient_capture.created_at) = '.$week)
                    ->first();
    }
    public function AdminWeeklyReport($hcfId,$week)
    {
        return DB::table('patient_capture')
                    ->select(DB::raw('count(patient_capture.id) as patientNumber, (select count(id) from patient_capture where status = 2 and WEEKOFYEAR(created_at) = '.$week.') as agreeToSwitch'))
                    ->join('user','user.id','=','patient_capture.user_id')
                    ->where('user.health_care_facility_id',$hcfId)
                    ->whereRaw('WEEKOFYEAR(patient_capture.created_at) = '.$week)
                    ->first();
    }

    public function GetTeamGoal($hcfId)
    {
        return DB::table('user')->where('health_care_facility_id',$hcfId)->sum('patient_goal');
    }

    public function TopWeeklyUser($hcfId,$week)
    {
        return DB::select("select user.id as userId, user.full_name as userName, count(patient_capture.id) as patientNumber
                            from user user 
                            LEFT JOIN  patient_capture  ON user.id = patient_capture.user_id and WEEKOFYEAR(patient_capture.created_at) =".$week." 
                            where user.health_care_facility_id =".$hcfId." 
                            group by user.id 
                            order by patientNumber desc
                            limit 5
                            offset 0
                            ");
    }
    public function TopWeeklyImprovement($hcfId,$week)
    {
        return DB::select("select user.id as userId, user.full_name as userName, count(patient_capture.id) as patientNumber
                            from user user 
                            LEFT JOIN  patient_capture  ON user.id = patient_capture.user_id and WEEKOFYEAR(patient_capture.created_at) =".$week." 
                            where user.health_care_facility_id =".$hcfId." 
                            group by user.id 
                            order by patientNumber
                            limit 5
                            offset 0
                            ");
    }
    public function AddGoal($userId,$goal)
    {
        return DB::table('user')->where('id',$userId)->update([
            'patient_goal' => $goal
        ]);
    }

    public function GetHospitalAdmin($hcfId)
    {
        return DB::table('user')->where('health_care_facility_id',$hcfId)->where('role', Constants::HOSPITAL_ADMIN)->first();
    }

    public function CompleteTutorial($userId)
    {
        return DB::table('user')->where('id',$userId)->update([
            'completed_tutorial' => 1
        ]);
    }
}

