<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use DB;

class QuotesModel extends Model
{
    public function GetQuote()
    {
    	return DB::select("SELECT * FROM quotes WHERE status = 0 ORDER BY last_used LIMIT 1 OFFSET 0");
    }

    public function GetNewQuote($quoteId)
    {
    	return DB::select("SELECT * FROM quotes WHERE id <> $quoteId AND status = 0 ORDER BY last_used LIMIT 1 OFFSET 0");
    }

    public function GetCurrentQuote()
    {
    	return DB::table('quotes')->where('status',1)->first();
    }

    public function UpdateQuoteStatus($quoteId,$status,$time)
    {
    	return DB::table('quotes')->where('id',$quoteId)->update([
    			'status' => $status,
    			'last_used' => $time
    		]);
    }
}
