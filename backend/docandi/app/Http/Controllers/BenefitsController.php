<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Constants\Constants;
use App\Models\Response;
use App\Models\BenefitsModel;
use App\Http\Requests;

session_start();

class BenefitsController extends Controller
{
	public $benefitObj;

    public function __construct()
    {
        $this->benefitObj = new BenefitsModel();
    }
    
    public function GetListBenefits()
    {
    	$responseData = new Response;
        $listBenefit = $this->benefitObj->GetListBenefits();
        if (!empty($listBenefit)) {
            $responseData->Data = $listBenefit;
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        } else {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
        }
        return json_encode($responseData);
    }
}
