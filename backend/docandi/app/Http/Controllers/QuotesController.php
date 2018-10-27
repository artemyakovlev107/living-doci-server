<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Constants\Constants;
use App\Models\Response;
use App\Models\QuotesModel;
use Carbon\Carbon;
use App\Http\Requests;

session_start();

class QuotesController extends Controller
{
    public function GetQuote()
    {
    	$responseData = new Response;
    	$quoteObj = new QuotesModel();
    	$currentQuotes = $quoteObj->GetCurrentQuote();
    	if(empty($currentQuotes)){
    		$quote = $quoteObj->GetQuote();
    		$status = 1;
    		$setTime = Carbon::now();
    		$setQuoteStatus = $quoteObj->UpdateQuoteStatus($quote[0]->id,$status,$setTime);
    	} else {
    		$date = new \DateTime($currentQuotes->last_used);
    		$week = $date->format("W");
    		$today =  new \DateTime(date("Y/m/d"));
    		$currentWeek = $today->format("W");
    		if($week == $currentWeek) {
    			$quote = $currentQuotes;
    		} else {
	    		$quote = $quoteObj->GetNewQuote($currentQuotes->id);
	    		$statusUnset = 0;
	    		$unsetTime = $currentQuotes->last_used;
	    		$unsetCurQuoteStatus = $quoteObj->UpdateQuoteStatus($currentQuotes->id,$statusUnset,$unsetTime);
	    		$newStatus = 1;
	    		$setTime = Carbon::now();
	    		$setQuoteStatus = $quoteObj->UpdateQuoteStatus($quote[0]->id,$newStatus,$setTime);
    		}
    	}
    	if (!empty($quote)) {
                $responseData->Data = $quote;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            }
        return json_encode($responseData);
    }
}
