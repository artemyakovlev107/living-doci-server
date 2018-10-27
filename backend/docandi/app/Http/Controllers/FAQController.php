<?php

namespace App\Http\Controllers;

use App\Constants\Constants;
use App\Models\FAQModel;
use App\Models\Response;
use Illuminate\Http\Request;
use Validator;
use App\Http\Requests;

class FAQController extends Controller
{
    public $faqObj;

    public function __construct()
    {
        $this->faqObj = new FAQModel();
    }
    public function AddFAQ(Request $request)
    {
        $responseData = new Response();
        $input = $request->all();
        $validator = Validator::make($input,[
            'question' => 'required',
            'answer' => 'required'
            ]);
        if($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            $listRequest = array(
                'question' => $input['question'],
                'answer' => $input['answer']
            );
            $addFAQ = $this->faqObj->AddFAQ($listRequest);
            if(empty($addFAQ)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            } else {
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            }
        }
        return json_encode($responseData);
    }

    public function ListFAQ()
    {
        $responseData = new Response();
        $listFAQ = $this->faqObj->GetListFAQ();
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        $responseData->Data = $listFAQ;
        return json_encode($responseData);
    }

    public function UpdateFAQ(Request $request)
    {
        $responseData = new Response();
        $input = $request->all();
        $validator = Validator::make($input,[
            'id' => 'required',
            'question' => 'required',
            'answer' => 'required'
        ]);
        if($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            $faq = $this->faqObj->GetFAQById($input['id']);
            if(empty($faq)) {
                $responseData->Status= Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_FAQ_NOT_FOUND;
            } else {
                $listRequest = array(
                    'question' => $input['question'],
                    'answer' => $input['answer']
                );
                $addFAQ = $this->faqObj->UpdateFAQ($input['id'],$listRequest);
                if(empty($addFAQ)) {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                }
            }
        }
        return json_encode($responseData);
    }

    public function DeleteFAQ(Request $request)
    {
        $responseData = new Response();
        $input = $request->all();
        $validator = Validator::make($input,[
            'id' => 'required'
        ]);
        if($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            $faq = $this->faqObj->GetFAQById($input['id']);
            if (empty($faq)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                $responseData->Message = Constants::RESPONSE_MESSAGE_FAQ_NOT_FOUND;
            } else {
                $deleteFAQ = $this->faqObj->DeleteFAQ($input['id']);
                if(empty($deleteFAQ)) {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                }
            }
        }
        return json_encode($responseData);
    }
}
