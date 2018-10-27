<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Constants\Constants;
use DB;

class BenefitsModel extends Model
{
    public function GetListBenefits()
    {
    	return DB::table('benefits')->select(DB::raw('*, Concat("'.Constants::IMAGES_URL.'",benefits.image_url) as image_url,Concat("'.Constants::IMAGES_URL.'",benefits.image_active_url) as image_active_url'))->get();
    }

    public function GetListPharmacyBenefits($pharmacyId)
    {
    	return DB::table('benefits')
    			->select('benefits.id','benefits.name','benefits.image_url','benefits.image_active_url')
    			->join('pharmacy_benefits','pharmacy_benefits.benefit_id','=','benefits.id')
    			->where('pharmacy_benefits.pharmacy_id',$pharmacyId)
    			->get();
    }
    public function ListBenefits()
    {
        return DB::table('benefits')->select('id','name')->get();
    }
    public function ListBenefitsId()
    {
        return DB::table('benefits')->pluck('id');
    }

    public function DeletePharmacyBenefit($pharmacyId)
    {
        return DB::table('pharmacy_benefits')->where('pharmacy_id',$pharmacyId)->delete();
    }
}
