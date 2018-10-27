<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class RxDetails extends Model
{
    protected $table = 'rx_details';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [];
    public $timestamps = true;

    public function AddReport($listRequest)
    {
        return DB::table('hcf_report')->insert($listRequest);
    }

    public function GetReportByTimeFrame($hcfId,$time)
    {
        return DB::table('hcf_report')->where('hcf_id',$hcfId)->where('date',$time)->first();
    }

    public function UpdateReport($reportId,$listRequest)
    {
        return DB::table('hcf_report')->where('id',$reportId)->update($listRequest);
    }

    public function GetUploadHistoryByHcfId($hcfId)
    {
        return DB::table('hcf_report')
            ->select('hcf_report.*','user.full_name as fullname')
            ->join('user','user.id','=','hcf_report.submitted_by')
            ->where('hcf_report.hcf_id',$hcfId)
            ->orderBy('hcf_report.date')
            ->get();
    }

}
