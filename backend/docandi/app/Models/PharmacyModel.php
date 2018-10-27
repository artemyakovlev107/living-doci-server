<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Constants\Constants;
use DB;
use Carbon\Carbon;

class PharmacyModel extends Model
{
    public function GetListPharmacyByHcfId($hcfId, $page)
    {
        return DB::table('pharmacy')
            ->select(DB::raw('pharmacy.*, GROUP_CONCAT(benefits.name) as benefitName, contracted_pharmacy.pharmacy_id as pharmacyId, Concat("' . Constants::IMAGES_URL . '",pharmacy.logo) as logo'))
            ->join('contracted_pharmacy', 'pharmacy.id', '=', 'contracted_pharmacy.pharmacy_id')
            ->leftjoin('pharmacy_benefits', 'pharmacy.id', '=', 'pharmacy_benefits.pharmacy_id')
            ->leftjoin('benefits', 'pharmacy_benefits.benefit_id', '=', 'benefits.id')
            ->where('health_care_facility_id', $hcfId)
            ->groupBy('contracted_pharmacy.pharmacy_id')
            ->orderBy('contracted_pharmacy.pharmacy_id')
            ->skip($page)
            ->take(Constants::LIMIT_PHARMACY)
            ->get();
    }

    public function GetPharmacyByHcfId($hcfId)
    {
        return DB::table('pharmacy')
            ->select(DB::raw('pharmacy.*, GROUP_CONCAT(benefits.name) as benefitName, contracted_pharmacy.pharmacy_id as pharmacyId, Concat("' . Constants::IMAGES_URL . '",pharmacy.logo) as logo'))
            ->join('contracted_pharmacy', 'pharmacy.id', '=', 'contracted_pharmacy.pharmacy_id')
            ->leftjoin('pharmacy_benefits', 'pharmacy.id', '=', 'pharmacy_benefits.pharmacy_id')
            ->leftjoin('benefits', 'pharmacy_benefits.benefit_id', '=', 'benefits.id')
            ->where('health_care_facility_id', $hcfId)
            ->groupBy('contracted_pharmacy.pharmacy_id')
            ->orderBy('contracted_pharmacy.pharmacy_id')
            ->get();
    }

    public function GetListPharmacyNearbyHcfLocation($hcfId, $latitude, $longitude, $benefitId, $sort)
    {
        if ($benefitId != 0) {
            $sql_filter = "WHERE contracted_pharmacy.health_care_facility_id = $hcfId AND pharmacy.id IN (SELECT pharmacy_id FROM pharmacy_benefits WHERE benefit_id = $benefitId)";
        } else {
            $sql_filter = "WHERE contracted_pharmacy.health_care_facility_id = $hcfId";
        }
        if ($sort == "features") {
            $sql_sort = "order by features DESC, benefits.name = 'Drive thru' DESC";
        } else {
            $sql_sort = "order by distance ASC";
        }
        return DB::select("SELECT pharmacy.*, CONCAT(GROUP_CONCAT(benefits.id,';',benefits.name,';',CONCAT('" . Constants::IMAGES_URL . "',benefits.image_url),';',CONCAT('" . Constants::IMAGES_URL . "',benefits.image_active_url))) AS benefit, CONCAT('" . Constants::IMAGES_URL . "',pharmacy.logo) AS logo, COUNT(pharmacy_benefits.id) AS features, round( 3959 * acos (
                              cos ( radians($latitude) )
                              * cos( radians(pharmacy.latitude) )
                              * cos( radians(pharmacy.longitude) - radians($longitude) )
                              + sin ( radians($latitude) )
                              * sin( radians(pharmacy.latitude) )
                               ),2
                             ) AS distance
            FROM pharmacy 
            LEFT JOIN pharmacy_benefits ON pharmacy.id = pharmacy_benefits.pharmacy_id 
            LEFT JOIN benefits ON pharmacy_benefits.benefit_id = benefits.id
            JOIN contracted_pharmacy ON pharmacy.id = contracted_pharmacy.pharmacy_id
            " . $sql_filter . "  
            GROUP BY pharmacy.id " . $sql_sort . "");
    }

    public function GetNumberOfPharmacy($hcfId)
    {
        return DB::table('contracted_pharmacy')->where('health_care_facility_id', $hcfId)->count('id');
    }

    public function GetAllPharmacy($hcfId)
    {
        return DB::table('pharmacy')
            ->select(DB::raw('pharmacy.*, Concat("' . Constants::IMAGES_URL . '",pharmacy.logo) as logo '))
            ->join('contracted_pharmacy', 'pharmacy.id', '=', 'contracted_pharmacy.pharmacy_id')
            ->where('contracted_pharmacy.health_care_facility_id', $hcfId)
            ->orderBy('pharmacy.id')
            ->get();
    }

    public function AddPharmacy($listRequest)
    {
        return DB::table('pharmacy')->insertGetId($listRequest);
    }

    public function AddContractPharmacy($pharmacyId, $hcfId)
    {
        return DB::table('contracted_pharmacy')->insert([
            'pharmacy_id' => $pharmacyId,
            'health_care_facility_id' => $hcfId,
            'created_at' => Carbon::now()
        ]);
    }

    public function EditPharmacy($id, $list)
    {
        return DB::table('pharmacy')->where('id', $id)->update($list);
    }

    public function DeletePharmacy($id)
    {
        return DB::table('pharmacy')->where('id', $id)->delete();
    }

    public function GetPharmacyByEmail($email)
    {
        return DB::table('pharmacy')->where('email', $email)->first();
    }

    public function GetPharmacyById($pharmacyId)
    {
        return DB::table('pharmacy')->where('id', $pharmacyId)->first();
    }

    public function GetListPharmacyNearbySearchPlace($hcfId, $latitude, $longitude, $benefitId, $sort)
    {
        if ($benefitId != 0) {
            $sql_filter = "WHERE contracted_pharmacy.health_care_facility_id = $hcfId AND pharmacy.id IN (SELECT pharmacy_id FROM pharmacy_benefits WHERE benefit_id = $benefitId)";
        } else {
            $sql_filter = "WHERE contracted_pharmacy.health_care_facility_id = $hcfId";
        }
        if ($sort == "features") {
            $sql_sort = "order by features DESC, benefits.name = 'Drive thru' DESC";
        } else {
            $sql_sort = "order by distance ASC";
        }
        return DB::select("SELECT pharmacy.*, CONCAT(GROUP_CONCAT(benefits.id,';',benefits.name,';',CONCAT('" . Constants::IMAGES_URL . "',benefits.image_url),';',CONCAT('" . Constants::IMAGES_URL . "',benefits.image_active_url))) AS benefit, Concat('" . Constants::IMAGES_URL . "',pharmacy.logo) AS logo, round( 3959 * acos (
                              cos ( radians($latitude) )
                              * cos( radians(pharmacy.latitude) )
                              * cos( radians(pharmacy.longitude) - radians($longitude) )
                              + sin ( radians($latitude) )
                              * sin( radians(pharmacy.latitude) )
                               ),2
                             ) AS distance, COUNT(pharmacy_benefits.id) AS features 
            FROM pharmacy 
            LEFT JOIN pharmacy_benefits ON pharmacy.id = pharmacy_benefits.pharmacy_id 
            LEFT JOIN benefits ON pharmacy_benefits.benefit_id = benefits.id
            JOIN contracted_pharmacy ON pharmacy.id = contracted_pharmacy.pharmacy_id 
            " . $sql_filter . " 
            GROUP BY pharmacy.id 
            " . $sql_sort . "");
    }

    public function GroupPharmacyByCity($hcfId)
    {
        return DB::select("SELECT pharmacy.city, GROUP_CONCAT(pharmacy.id,'-',pharmacy.name,'-',pharmacy.address,'-',pharmacy.zip separator ';') AS Data FROM pharmacy JOIN contracted_pharmacy ON pharmacy.id = contracted_pharmacy.pharmacy_id WHERE contracted_pharmacy.health_care_facility_id = $hcfId GROUP BY city");
    }

    public function AddPharmacyBenefit($listRequest)
    {
        return DB::table('pharmacy_benefits')->insert($listRequest);
    }

    public function CheckPharmacyBenefit($pharmacyId, $benefitId)
    {
        return DB::table('pharmacy_benefits')->where('pharmacy_id', $pharmacyId)->where('benefit_id', $benefitId)->get();
    }

    public function DeletePharmacyByHcfId($hcfId)
    {
        return DB::table('pharmacy')->join('contracted_pharmacy', 'contracted_pharmacy.pharmacy_id', '=', 'pharmacy.id')->where('contracted_pharmacy.health_care_facility_id', $hcfId)->delete();
    }

}
