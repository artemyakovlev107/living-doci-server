<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Constants\Constants;
use DB;
use Carbon\Carbon;

class HcfModel extends Model
{
   public function GetListHcf()
   {
      /*return DB::table('health_care_facility')->select(DB::raw('health_care_facility.*,user.full_name as full_name,user.email as email,Concat("'.Constants::IMAGES_URL.'",image_url) as image_url'))->leftjoin('user','user.health_care_facility_id','=','health_care_facility.id')->where('user.role',Constants::HOSPITAL_ADMIN)->orWhere('user.role',Constants::SUPER_ADMIN)->get();*/
      return DB::select("SELECT health_care_facility.*,user.full_name as full_name,user.email as email, Concat('".Constants::IMAGES_URL."',image_url) as image_url FROM health_care_facility LEFT JOIN user ON user.health_care_facility_id = health_care_facility.id and (user.role = ".Constants::HOSPITAL_ADMIN." or user.role = ".Constants::SUPER_ADMIN.")");
   }
   public function GetHcfDetails($hcfId)
   {
		return DB::table('health_care_facility')->select(DB::raw('*,Concat("'.Constants::IMAGES_URL.'",image_url) as image_url,Concat("'.Constants::IMAGES_URL.'",discount_card_image_url) as discount_card_image_url'))
            ->where('id',$hcfId)
            ->first();
   }

   public function GetHcfById($hcfId)
   {
      return DB::table('health_care_facility')->where('id',$hcfId)->first();
   }
   
   public function DeleteHcf($hcfId)
   {
      return DB::table('health_care_facility')->where('id',$hcfId)->delete();
   }

   public function GetHcfImage($hcfId)
   {
      return DB::table('health_care_facility')->select('image_url')->where('id',$hcfId)->first();
   }

   public function GetListHcfLocation($hcfId)
   {
      return DB::table('hcf_location')
            ->select(DB::raw('*,Concat("'.Constants::IMAGES_URL.'",image_url) as image_url'))
            ->where('health_care_facility_id',$hcfId)
            ->get();
   }

	public function AddHcfLocation($list)
	{
		return DB::table('hcf_location')->insertGetId($list);
	}

   public function UpdateHcfLocation($id,$list)
   {
      return DB::table('hcf_location')->where('id',$id)->update($list);
   }

   public function DeleteHcfLocation($hcfId)
   {
      return DB::table('hcf_location')->where('id',$hcfId)->delete();
   }

   public function CheckEmail($email)
   {
      return DB::table('hcf_location')->where('email',$email)->first();
   }

   public function checkHcfId($hcfId)
   {
      return DB::table('health_care_facility')->where('id',$hcfId)->first();
   }

   public function CheckHcfLocationId($hcfLocationId,$hcfId)
   {
      return DB::table('hcf_location')->where('id',$hcfLocationId)->where('health_care_facility_id',$hcfId)->first();
   }

   public function CheckEmailUpdate($email, $id)
   {
      return DB::table('hcf_location')->where('email',$email)->where('id', '<>', $id)->first();
   }

   public function AddHcf($hospitalName, $imageUrl,$introduction)
   {
      return DB::table('health_care_facility')->insertGetId([
            'name' => $hospitalName,
            'image_url' => $imageUrl,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'introduction' => $introduction,
            'rxgrp' => Constants::RXGRP,
            'input_code' => Constants::INPUT_CODE,
            'discount_card_image_url' => Constants::DISCOUNT_CARD_DEFAULT_LOGO,
         ]);
   }
   public function GetHcfLocationById($locationId)
   {
       return DB::table('hcf_location')->where('id',$locationId)->first();
   }

   public function GetHcfLocationDetails($hcfLocationId)
   {
      return DB::table('hcf_location')->where('id',$hcfLocationId)->first();
   }

   public function UpdateHcf($hcfId, $listRequest) 
   {
       return DB::table('health_care_facility')->where('id',$hcfId)->update($listRequest);
   }

   public function  UpdateHcfIntroduction($hcfId, $introduction)
   {
       return DB::table('health_care_facility')->where('id',$hcfId)->update([
           'introduction' => $introduction
       ]);
   }

   public function UpdateDiscountCardInfo($hcfId,$rxgrp,$inputCode,$imageUrl)
   {
      if(empty($imageUrl)) {
         return DB::table('health_care_facility')->where('id',$hcfId)->update([
             'rxgrp' => $rxgrp,
             'input_code' => $inputCode,
             'updated_at' => Carbon::now()
         ]);
      } else {
         return DB::table('health_care_facility')->where('id',$hcfId)->update([
             'rxgrp' => $rxgrp,
             'input_code' => $inputCode,
             'discount_card_image_url' => $imageUrl,
             'updated_at' => Carbon::now()
         ]);
      }
   }

   public function GetUploadBaseLineByHcf($hcfId)
   {
       return DB::table('hcf_upload_baseline')->where('hcf_id',$hcfId)->first();
   }

   public function AddHcfUploadBaseLine($listRequest)
   {
       return DB::table('hcf_upload_baseline')->insert($listRequest);
   }

   public function UpdateHcfUploadBaseLine ($listRequest, $hcfId)
   {
       return DB::table('hcf_upload_baseline')->where('hcf_id',$hcfId)->update($listRequest);
   }
}
