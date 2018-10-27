<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use App\Constants\Constants;
use DB;

class PatientCaptureModel extends Model
{
    public function CreatePatientCapture($list)
    {
    	return DB::table('patient_capture')->insertGetId($list);
    }

    public function AddBenefitsMapViewed($listRequest)
    {
        return DB::table('benefits_map_viewed')->insert($listRequest);
    }

    public function GetTotalDayPoint($userId)
    {
    	return DB::table('patient_capture')
    		->where('user_id',$userId)
    		->whereRaw("DATE(created_at) = '".date('Y-m-d')."'")
    		->sum('point');
    }

    public function GetTotalMonthPoint($userId)
    {
    	return DB::table('patient_capture')
    		->where('user_id',$userId)
    		->whereMonth('created_at','=',date('m'))
    		->sum('point');
    }
    public function GetTotalMonthTotalPatient($userId)
    {
    	return DB::table('patient_capture')
    		->where('user_id',$userId)
    		->whereMonth('created_at','=',date('m'))
    		->count();
    }
    public function GetTotalDayPatient($userId)
    {
    	return DB::table('patient_capture')
    		->where('user_id',$userId)
    		->whereRaw("DATE(created_at) = '".date('Y-m-d')."'")
    		->count();
    }
    public function GetListTotalMonthPatient($userId)
    {
        return DB::select("select month(created_at) as month, COUNT(id) as total_patient from patient_capture where year(created_at) = '".date('Y')."' and user_id = $userId group by year(created_at), month(created_at)");
    }

    public function GetListNotContracted($userId)
    {
        return DB::select("select month(created_at) as month, COUNT(id) as total_patient from patient_capture where year(created_at) = '".date('Y')."' and user_id = $userId and patient_capture.status <> 1 group by year(created_at), month(created_at)");
    }

    public function GetListSwitched($userId)
    {
        return DB::select("select month(created_at) as month, COUNT(id) as total_patient from patient_capture where year(created_at) = '".date('Y')."' and user_id = $userId and patient_capture.status = 2 group by year(created_at), month(created_at)");
    }

    public function GetTotalMonthPatientByHcf($locationId,$hcfId)
    {
        if($locationId != 0) {
            return DB::select("select month(created_at) as month, COUNT(id) as total_patient from patient_capture where year(created_at) = '".date('Y')."' and hcf_location_id = $locationId group by year(created_at), month(created_at)");
        } else {
            return DB::select("select month(created_at) as month, COUNT(id) as total_patient from patient_capture where year(created_at) = '".date('Y')."' and health_care_facility_id = $hcfId group by year(created_at), month(created_at)");
        }
    }

    public function GetListTotalMonthPatientSaving($userId)
    {
        return DB::select("select month(created_at) as month, COUNT(id) as total_patient from patient_capture where year(created_at) = '".date('Y')."' and user_id = $userId and status <> 3 group by year(created_at), month(created_at)");
    }

    public function GetListTotalMonthPatientSavingByLocation($locationId,$hcfId)
    {
        if($locationId ==0 ) {
            return DB::select("select month(created_at) as month, COUNT(id) as total_patient from patient_capture 
                                where year(created_at) = '".date('Y')."' and health_care_facility_id = $hcfId and status <> 3 
                                group by year(created_at), month(created_at)");
        } else {
            return DB::select("select month(created_at) as month, COUNT(id) as total_patient from patient_capture 
                                where year(created_at) = '".date('Y')."' and hcf_location_id = $locationId and status <> 3 
                                group by year(created_at), month(created_at)");
        }
    }

    public function PatientsCaptureSumary($dateStart,$dateEnd,$locationId,$hcfId)
    {
        if($locationId == 0) {
            $sql = "patient_capture.health_care_facility_id =$hcfId AND patient_capture.created_at BETWEEN '$dateStart' AND '$dateEnd' ";
        } else {
            $sql = "patient_capture.hcf_location_id =$locationId AND patient_capture.created_at BETWEEN '$dateStart' AND '$dateEnd'";
        }
        return DB::select("SELECT SUM(patient_capture.saving) as TotalPatientSaving,
                                  COUNT(patient_capture.id) as PatientCaptured,
                                  (SELECT COUNT(patient_capture.id) FROM patient_capture WHERE patient_capture.status = 1 AND ".$sql.") AS Contracted,
                                  (SELECT COUNT(patient_capture.id) FROM patient_capture WHERE patient_capture.status = 2 AND ".$sql.") AS AgreeToSwitch,
                                  (SELECT COUNT(patient_capture.id) FROM patient_capture WHERE patient_capture.status = 3 AND ".$sql.") AS NotAgreeToSwitch
                                  FROM patient_capture
                                  WHERE patient_capture.health_care_facility_id = $hcfId AND ".$sql."
                                  ");
    }

    public function GetReasonSumary($dateStart,$dateEnd,$locationId,$hcfId)
    {
        if($locationId == 0) {
            return DB::table('patient_capture')
                ->select(DB::raw('reason, count(id) as patientNumber'))
                ->groupBy('reason')
                ->orderBy('reason')
                ->where('reason','<>', null)
                ->where('reason','<>', 0)
                ->where('patient_capture.health_care_facility_id',$hcfId)
                ->whereBetween('patient_capture.created_at',[$dateStart,$dateEnd])
                ->get();
        } else {
            return DB::table('patient_capture')
                ->select(DB::raw('reason, count(id) as patientNumber'))
                ->groupBy('reason')
                ->orderBy('reason')
                ->where('reason','<>', null)
                ->where('reason','<>', 0)
                ->where('patient_capture.hcf_location_id',$locationId)
                ->whereBetween('patient_capture.created_at',[$dateStart,$dateEnd])
                ->get();
        }
    }

    public function GetTopCurrentPharmacy($dateStart,$dateEnd,$locationId,$hcfId)
    {
        if($locationId == 0) {
            return DB::table('pharmacy')->select(DB::raw('pharmacy.id,pharmacy.name,pharmacy.address,Concat("'.Constants::IMAGES_URL.'",pharmacy.logo) as logo,count(patient_capture.id) as numberOfPatient'))
                ->join('patient_capture','patient_capture.pharmacy_id','=','pharmacy.id')
                ->where('patient_capture.status',1)
                ->where('patient_capture.health_care_facility_id',$hcfId)
                ->whereBetween('patient_capture.created_at',[$dateStart,$dateEnd])
                ->groupBy('patient_capture.pharmacy_id')
                ->orderBy('numberOfPatient','desc')
                ->skip(0)
                ->take(5)
                ->get();
        } else {
            return DB::table('pharmacy')->select(DB::raw('pharmacy.id,pharmacy.name,pharmacy.address,Concat("'.Constants::IMAGES_URL.'",pharmacy.logo) as logo,count(patient_capture.id) as numberOfPatient'))
                ->join('patient_capture','patient_capture.pharmacy_id','=','pharmacy.id')
                ->where('patient_capture.status',1)
                ->where('patient_capture.hcf_location_id',$locationId)
                ->whereBetween('patient_capture.created_at',[$dateStart,$dateEnd])
                ->groupBy('patient_capture.pharmacy_id')
                ->orderBy('numberOfPatient','desc')
                ->skip(0)
                ->take(5)
                ->get();
        }
    }

    public function GetTopSwitchLocation($dateStart,$dateEnd,$locationId,$hcfId)
    {
        if($locationId == 0) {
            return DB::table('pharmacy')->select(DB::raw('pharmacy.id,pharmacy.name,pharmacy.address,Concat("'.Constants::IMAGES_URL.'",pharmacy.logo) as logo,count(patient_capture.id) as numberOfPatient'))
                ->join('patient_capture','patient_capture.pharmacy_id','=','pharmacy.id')
                ->where('patient_capture.status',2)
                ->where('patient_capture.health_care_facility_id',$hcfId)
                ->whereBetween('patient_capture.created_at',[$dateStart,$dateEnd])
                ->groupBy('patient_capture.pharmacy_id')
                ->orderBy('numberOfPatient','desc')
                ->skip(0)
                ->take(5)
                ->get();
        } else {
            return DB::table('pharmacy')->select(DB::raw('pharmacy.id,pharmacy.name,pharmacy.address,Concat("'.Constants::IMAGES_URL.'",pharmacy.logo) as logo,count(patient_capture.id) as numberOfPatient'))
                ->join('patient_capture','patient_capture.pharmacy_id','=','pharmacy.id')
                ->where('patient_capture.status',2)
                ->where('patient_capture.hcf_location_id',$locationId)
                ->whereBetween('patient_capture.created_at',[$dateStart,$dateEnd])
                ->groupBy('patient_capture.pharmacy_id')
                ->orderBy('numberOfPatient','desc')
                ->skip(0)
                ->take(5)
                ->get();
        }
    }

    public function PickedPreferred($dateStart,$dateEnd,$locationId,$hcfId)
    {
        if($locationId == 0) {
            return DB::table('patient_capture')
                ->where('use_recommend_pharmacy',1)
                ->where('patient_capture.health_care_facility_id',$hcfId)
                ->whereBetween('patient_capture.created_at',[$dateStart,$dateEnd])
                ->count();
        } else {
            return DB::table('patient_capture')
                ->where('use_recommend_pharmacy',1)
                ->where('patient_capture.hcf_location_id',$locationId)
                ->whereBetween('patient_capture.created_at',[$dateStart,$dateEnd])
                ->count();
        }
    }

    public function DeletePatientCaptureByLocationId($locationId)
    {
        return DB::table('patient_capture')->where('hcf_location_id',$locationId)->delete();
    }

    public function SoftwareUsage($dateStart,$dateEnd,$locationId,$hcfId)
    {
        if($locationId == 0) {
            //return DB::table('patient_capture')->where('health_care_facility_id',$hcfId)->where('used_map',1)->whereBetween('created_at',array($dateStart,$dateEnd))->count('id');
            return DB::select("SELECT (SELECT COUNT(id) FROM patient_capture WHERE health_care_facility_id = $hcfId AND created_at BETWEEN '$dateStart' AND '$dateEnd') AS TotalPatient,
                                       COUNT(id) AS UsedMap
                                       FROM patient_capture
                                       WHERE health_care_facility_id = $hcfId AND used_map = 1 AND created_at BETWEEN '$dateStart' AND '$dateEnd'");
        } else {
            return DB::select("SELECT (SELECT COUNT(id) FROM patient_capture WHERE health_care_facility_id = $hcfId AND created_at BETWEEN '$dateStart' AND '$dateEnd') AS TotalPatient,
                                       COUNT(id) AS UsedMap
                                       FROM patient_capture
                                       WHERE hcf_location_id = $locationId AND used_map = 1 AND created_at BETWEEN '$dateStart' AND '$dateEnd'");
        }
    }

    public function MapView ($dateStart,$dateEnd,$locationId,$hcfId,$benefitId)
    {
        if($locationId == 0) {
            return DB::select(" SELECT  COUNT(benefits_map_viewed.id) as viewedTimes, benefits.* 
                                FROM benefits
                                JOIN benefits_map_viewed ON benefits.id = benefits_map_viewed.benefit_id
                                JOIN patient_capture ON patient_capture.id = benefits_map_viewed.patient_capture_id
                                WHERE patient_capture.health_care_facility_id = $hcfId
                                AND benefits.id = $benefitId
                                AND patient_capture.created_at BETWEEN '$dateStart' AND '$dateEnd'");
        } else {
            return DB::select(" SELECT COUNT(benefits_map_viewed.id) as viewedTimes,benefits.* 
                                FROM benefits
                                JOIN benefits_map_viewed ON benefits.id = benefits_map_viewed.benefit_id
                                JOIN patient_capture ON patient_capture.id = benefits_map_viewed.patient_capture_id
                                WHERE patient_capture.hcf_location_id = $locationId
                                AND benefits.id = $benefitId
                                AND patient_capture.created_at BETWEEN '$dateStart' AND '$dateEnd'");
        }
    }

    public function TotalFreedomChoicePickedSumary($locationId,$hcfId)
    {
        if($locationId == 0) {
            return DB::select("select month(created_at) as month, COUNT(id) as total_patient from patient_capture 
                                where year(created_at) = '".date('Y')."' and health_care_facility_id = $hcfId and told_freedom_choice = 1
                                group by year(created_at), month(created_at)");
        } else {
            return DB::select("select month(created_at) as month, COUNT(id) as total_patient from patient_capture 
                                where year(created_at) = '".date('Y')."' and hcf_location_id = $locationId and told_freedom_choice = 1 
                                group by year(created_at), month(created_at)");
        }
    }

    public function AverageTimePerPatient($dateStart,$dateEnd,$locationId,$hcfId)
    {
        if($locationId == 0) {
            return DB::select("select AVG( time_for_step_1 + time_for_step_2) as AverageTimePerPatient
                                      FROM patient_capture 
                                      WHERE health_care_facility_id = $hcfId AND patient_capture.created_at BETWEEN '$dateStart' AND '$dateEnd' ");
        } else {
            return DB::select("select AVG( time_for_step_1 + time_for_step_2) AS AverageTimePerPatient 
                                      FROM patient_capture 
                                      WHERE hcf_location_id = $locationId AND patient_capture.created_at BETWEEN '$dateStart' AND '$dateEnd'");
        }
    }

    public function AverageTimePerPatientNotSwitch($dateStart,$dateEnd,$locationId,$hcfId)
    {
        if($locationId == 0) {
            return DB::select("select AVG( time_for_step_1 + time_for_step_2) AS AverageTimePerPatientNotSwitch
                                      FROM patient_capture 
                                      WHERE health_care_facility_id = $hcfId 
                                      AND patient_capture.created_at BETWEEN '$dateStart' AND '$dateEnd'
                                      AND status = 3 ");
        } else {
            return DB::select("select AVG( time_for_step_1 + time_for_step_2) AS AverageTimePerPatientNotSwitch
                                      FROM patient_capture 
                                      WHERE hcf_location_id = $locationId AND patient_capture.created_at BETWEEN '$dateStart' AND '$dateEnd'
                                      AND status = 3 ");
        }
    }
}
