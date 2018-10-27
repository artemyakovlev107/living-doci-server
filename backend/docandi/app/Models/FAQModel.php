<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class FAQModel extends Model
{
    public function AddFAQ($listRequest)
    {
       return DB::table('faq')->InsertGetId($listRequest);
    }

    public function GetListFAQ()
    {
        return DB::table('faq')->get();
    }

    public function GetFAQById($id)
    {
        return DB::table('faq')->where('id',$id)->first();
    }

    public function UpdateFAQ($id,$listRequest)
    {
        return DB::table('faq')->where('id',$id)->update($listRequest);
    }

    public function DeleteFAQ($id)
    {
        return DB::table('faq')->where('id',$id)->delete();
    }
}
