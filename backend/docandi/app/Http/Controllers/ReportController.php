<?php

namespace App\Http\Controllers;

use App\Constants\Constants;
use App\Models\Emr;
use App\Models\FinancialStatement;
use App\Models\Report;
use App\Models\RxDetails;
use Illuminate\Http\Request;
use App\Models\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use PHPExcel_IOFactory;
use Validator;
use DateTime;
use App\Http\Requests;


session_start();

class ReportController extends Controller
{
    public function UploadReport(Request $request)
    {
        $responseData = new Response();
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $input = $request->all();
        // $validator = Validator::make($input, [
        //     'financial' => 'required',
        // ]);
        // if ($validator->fails()) {
        //     $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
        //     $responseData->Message = $validator->errors()->first();
        // } else {
            $emrUrl = '';
            if (!empty($input['emr'])) {
                if ($input['emr']->getClientOriginalName()) {
                    $emrExtension = $input['emr']->getClientOriginalExtension();
                    if ($emrExtension != 'csv' && $emrExtension != 'xls' && $emrExtension != 'xlsx') {
                        $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                        $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
                        return json_encode($responseData);
                    } else {
                        $emrFileName = str_random(6) . time() . uniqid() . '.' . $emrExtension;
                        $emrUrl = Constants::REPORT_UPLOAD_URL . $emrFileName;
                        $input['emr']->move(public_path(Constants::REPORT_UPLOAD_URL), $emrFileName);

                        //read emr file and push data to array
                        $tmpfname = public_path(Constants::REPORT_UPLOAD_URL) . $emrFileName;
                        $file = fopen(public_path(Constants::REPORT_UPLOAD_URL) . $emrFileName, "r");
                        $excelReader = PHPExcel_IOFactory::createReaderForFile($tmpfname);
                        $excelObj = $excelReader->load($tmpfname);
                        $emr = $excelObj->getSheet(0);
                        $emrData = array();
                        $i = 0;
                        foreach ($emr->getRowIterator() AS $row) {
                            if ($i == 0) {
                                $j = 0;
                                $cellIterator = $row->getCellIterator();
                                $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                                foreach ($cellIterator as $cell) {
                                    if ($j == 2) {
                                        $timePeriod = $cell->getValue();
                                        $timePeriod = preg_replace('/[^A-Za-z0-9\- ]/', '', $timePeriod);
                                        $timePeriod = trim(str_replace('time period', '', strtolower($timePeriod)));
                                        $timeStamp = date("Y-m-d", strtotime($timePeriod));
                                    }
                                    $j++;
                                }
                            }
                            if ($i > 0) {
                                $rowData = array();
                                $cellIterator = $row->getCellIterator();
                                $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                                foreach ($cellIterator as $cell) {
                                    array_push($rowData, trim($cell->getValue()));
                                }
                                array_push($emrData, $rowData);
                            }
                            $i++;
                        }

                        //check required fields is empty or not
                        $listRequired = array("Pharmacy Name", "Store Number", "Address", "City", "State", "ZipCode", "340B Contracted (Y/N)", "Rx Count");
                        foreach ($listRequired as $key => $value) {
                            if (!in_array(trim($value), $emrData[0])) {
                                $responseData->Status = 1;
                                $responseData->Message = "You have uploaded a document which have missing information related to " . $value . ". Please re-check the document and re-upload.";
                                return json_encode($responseData);
                            }
                        }

                        //check emr Detail if exist
                        $checkEmrDetail = Emr::where('time', $timeStamp)->first();
                        if (!empty($checkEmrDetail)) {
                            //delete Rx Detail if exist
                            Emr::where('time', $timeStamp)->delete();
                        }

                        //import data to database
                        $i = 0;
                        foreach ($emrData as $key => $value) {
                            if ($i > 0) {
                                $address = $value[2] . ', ' . $value[3] . ',' . $value[4] . ', ' . 'US'; // Google HQ
                                $prepAddr = str_replace(' ', '+', $address);
                                $geocode = file_get_contents('https://maps.google.com/maps/api/geocode/json?key=' . Constants::GEO_API_KEY . '&address=' . $prepAddr . '&sensor=false');
                                $output = json_decode($geocode);
                                $latitude = $output->results[0]->geometry->location->lat;
                                $longitude = $output->results[0]->geometry->location->lng;
                                $emrObj = new Emr();
                                $emrObj->pharmacy_name = $value[0];
                                $emrObj->store_number = $value[1];
                                $emrObj->latitude = $latitude;
                                $emrObj->longitude = $longitude;
                                $emrObj->address = $value[2];
                                $emrObj->city = $value[3];
                                $emrObj->state = $value[4];
                                $emrObj->zip = $value[5];
                                $emrObj->contracted = ($value[6] == 'Y') ? 1 : 0;
                                $emrObj->rx_count = $value[7];
                                $emrObj->time = $timeStamp;
                                $emrObj->hcf_id = $user->health_care_facility_id;
                                $emrObj->save();
                            }
                            $i++;
                        }

                    }
                }
            }
            else if ($input['financial']->getClientOriginalName()) {
                $financialExtension = $input['financial']->getClientOriginalExtension();
                if ($financialExtension != 'csv' && $financialExtension != 'xls' && $financialExtension != 'xlsx') {
                    $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                    $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
                    return json_encode($responseData);
                } else {
                    $financialName = str_random(6) . time() . uniqid() . '.' . $financialExtension;
                    $financialUrl = Constants::REPORT_UPLOAD_URL . $financialName;
                    $input['financial']->move(public_path(Constants::REPORT_UPLOAD_URL), $financialName);

                    //read financial statement sheet
                    $tmpfname = public_path(Constants::REPORT_UPLOAD_URL) . $financialName;
                    $file = fopen(public_path(Constants::REPORT_UPLOAD_URL) . $financialName, "r");
                    $excelReader = PHPExcel_IOFactory::createReaderForFile($tmpfname);
                    $excelObj = $excelReader->load($tmpfname);

                    $financialStatement = $excelObj->getSheet(0);
                    $i = 0;
                    $financialStatementData = array();
                    $timeStamp = 0;
                    $isBaseLine = 0;
                    foreach ($financialStatement->getRowIterator() AS $row) {
                        if ($i == 2) {
                            $j = 0;
                            $cellIterator = $row->getCellIterator();
                            $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                            foreach ($cellIterator as $cell) {
                                if ($j == 4) {
                                    $timePeriod = $cell->getValue();
                                    if (!empty(strpos(strtolower($timePeriod), 'baseline'))) {
                                        $isBaseLine = 1;
                                    } else {
                                        $isBaseLine = 0;
                                        $timePeriod = preg_replace('/[^A-Za-z0-9\- ]/', '', $timePeriod);
                                        $timePeriod = trim(str_replace('time period', '', strtolower($timePeriod)));
                                        $timeStamp = date("Y-m-d", strtotime($timePeriod));
                                    }
                                }
                                $j++;
                            }
                        }
                        if ($i >= 8) {
                            $rowData = array();
                            $j = 0;
                            $cellIterator = $row->getCellIterator();
                            $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                            foreach ($cellIterator as $cell) {
                                array_push($rowData, $cell->getValue());
                            }
                            array_push($financialStatementData, $rowData);
                        }
                        $i++;
                    }
                    if (empty($financialStatementData[10][12]) && empty ($input['retail_net_increased_access_dollars'])) {
                        $responseData->Status = 0;
                        $responseData->Message = "You have uploaded a document which have missing information related to Retail Net Increased Access Dollars. Please re-check the document and re-upload or fill in the data for two following fields.";
                        return json_encode($responseData);
                    } else {
                        if ($isBaseLine == 0) {
                            $i = 1;
                            // $rxDetails = $excelObj->getSheet(1);
                            $rxDetails = $excelObj->getSheet(0);
                            $rxDetailsData = array();
                            foreach ($rxDetails->getRowIterator() AS $row) {
                                if ($i >= 7) {
                                    $rowData = array();
                                    $j = 0;
                                    $cellIterator = $row->getCellIterator();
                                    $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                                    foreach ($cellIterator as $cell) {
                                        array_push($rowData, trim($cell->getValue()));
                                    }
                                    array_push($rxDetailsData, $rowData);
                                }
                                $i++;
                            }
                            //check required fields is empty or not
                            $listRequired = array("Claim Type", 'Prescriber Name', 'Rx Claims Sold', 'Pharmacy Location', 'Pharmacy', 'Estimated 340B Cost', 'Plan AR Amt', "Copay Amt", "Increased Access Dollars", "Est. AWP Cost");
                            foreach ($listRequired as $key => $value) {
                                if (!in_array(trim($value), $rxDetailsData[0])) {
                                    $responseData->Status = 1;
                                    $responseData->Message = "You have uploaded a document which have missing information related to " . $value . ". Please re-check the document and re-upload.";
                                    return json_encode($responseData);
                                }
                            }

                            //check financial statement if exist
                            $checFinancialStatement = FinancialStatement::where('time', $timeStamp)->where('hcf_id', $user->health_care_facility_id)->first();
                            if (!empty($checFinancialStatement)) {
                                //delete Rx Detail if exist
                                FinancialStatement::where('time', $timeStamp)->where('hcf_id', $user->health_care_facility_id)->delete();
                            }
                            // add to financial statement
                            $financialStatement = new FinancialStatement();
                            $financialStatement->total_estimated_340b_cost = -($financialStatementData[0][4] + $financialStatementData[1][4] + $financialStatementData[2][4] + $financialStatementData[3][4]);
                            $financialStatement->reconciliation = -$financialStatementData[8][12];
                            $financialStatement->time = $timeStamp;
                            if (empty($input['retail_net_increased_access_dollars'])) {
                                $financialStatement->retail_net_increased_access_dollars = $financialStatementData[10][12];
                            } else {
                                $financialStatement->retail_net_increased_access_dollars = $input['retail_net_increased_access_dollars'];
                            }
                            $financialStatement->hcf_id = $user->health_care_facility_id;
                            $financialStatement->save();
                            //check Rx Detail if exist
                            $checkRxDetail = RxDetails::where('time', $timeStamp)->where('hcf_id', $user->health_care_facility_id)->first();
                            if (!empty($checkRxDetail)) {
                                //delete Rx Detail if exist
                                RxDetails::where('time', $timeStamp)->where('hcf_id', $user->health_care_facility_id)->delete();
                            }
                            //add to rx detail
                            $i = 0;
                            foreach ($rxDetailsData as $key => $value) {
                                if ($i > 0) {
                                    $rx = new RxDetails();
                                    $rx->claim_type = $value[5];
                                    $rx->prescriber_name = $value[14];
                                    $rx->rx_claim_sold = $value[21];
                                    $rx->pharmacy_location = $value[13];
                                    $rx->pharmacy = $value[12];
                                    $rx->estimated_340b_cost = $value[28];
                                    $rx->plan_ar_amt = $value[29];
                                    $rx->copay_amt = $value[30];
                                    $rx->increased_access_dollars = $value[36];
                                    $rx->est_awp_cost = $value[38];
                                    $rx->time = $timeStamp;
                                    $rx->hcf_id = $user->health_care_facility_id;
                                    $rx->save();
                                }
                                $i++;
                            }
                            // check if document was uploaded
                            $report = Report::where('date', $timeStamp)->where('is_base_line', 0)->where('hcf_id', $user->health_care_facility_id)->first();
                            if (empty($report)) {
                                $report = new Report();
                            }
                            $report->financial_url = $financialUrl;
                            $report->hcf_id = $user->health_care_facility_id;
                            $report->emr_url = $emrUrl;
                            $report->date = $timeStamp;
                            $report->submitted_by = $user->id;
                            $report->save();

                        } else {
                            $delete = FinancialStatement::where('is_base_line', 1)->where('hcf_id', $user->health_care_facility_id)->delete();
                            $financialStatement = new FinancialStatement();
                            $financialStatement->total_estimated_340b_cost = -($financialStatementData[0][4] + $financialStatementData[1][4] + $financialStatementData[2][4] + $financialStatementData[3][4]);
                            $financialStatement->reconciliation = -$financialStatementData[8][12];
                            $financialStatement->is_base_line = 1;
                            if (empty($input['retail_net_increased_access_dollars'])) {
                                $financialStatement->retail_net_increased_access_dollars = $financialStatementData[10][12];
                            } else {
                                $financialStatement->retail_net_increased_access_dollars = $input['retail_net_increased_access_dollars'];
                            }
                            $financialStatement->hcf_id = $user->health_care_facility_id;
                            $financialStatement->save();
                            $report = Report::where('is_base_line', 1)->where('hcf_id', $user->health_care_facility_id)->first();
                            if (empty($report)) {
                                $report = new Report();
                            }
                            $report->is_base_line = 1;
                            $report->financial_url = $financialUrl;
                            $report->hcf_id = $user->health_care_facility_id;
                            $report->emr_url = $emrUrl;
                            $report->date = $timeStamp;
                            $report->submitted_by = $user->id;
                            $report->save();
                        }
                        //read rx detail sheet
                        $data = objectValue();
                        if (!empty($input['retail_net_increased_access_dollars'])) {
                            $data->netIncrease = $input['retail_net_increased_access_dollars'];
                        } else {
                            $data->netIncrease = $financialStatementData[10][12];
                        }
                        $data->reconciliation = -$financialStatementData[8][12];
                        $responseData->Data = $data;
                        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                    }
                }
            }
            return json_encode($responseData);
        // }
    }

    public function UploadSpecificFile(Request $request)
    {
        $responseData = new Response();
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $input = $request->all();
        $validator = Validator::make($input, [
            'file' => 'required',
            'type' => 'required',
            'time_frame' => 'required'
        ]);
        if ($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            $timeFrame = date("Y-m-d",strtotime($input['time_frame']));
            if ($input['type'] == 1) {
                if ($input['file']->getClientOriginalName()) {
                    $financialExtension = $input['file']->getClientOriginalExtension();
                    if ($financialExtension != 'csv' && $financialExtension != 'xls' && $financialExtension != 'xlsx') {
                        $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                        $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
                        return json_encode($responseData);
                    } else {
                        $financialName = str_random(6) . time() . uniqid() . '.' . $financialExtension;
                        $financialUrl = Constants::REPORT_UPLOAD_URL . $financialName;
                        $input['file']->move(public_path(Constants::REPORT_UPLOAD_URL), $financialName);

                        //read financial statement sheet
                        $tmpfname = public_path(Constants::REPORT_UPLOAD_URL) . $financialName;
                        $file = fopen(public_path(Constants::REPORT_UPLOAD_URL) . $financialName, "r");
                        $excelReader = PHPExcel_IOFactory::createReaderForFile($tmpfname);
                        $excelObj = $excelReader->load($tmpfname);

                        $financialStatement = $excelObj->getSheet(0);
                        $i = 0;
                        $financialStatementData = array();
                        foreach ($financialStatement->getRowIterator() AS $row) {
                            if ($i >= 8) {
                                $rowData = array();
                                $j = 0;
                                $cellIterator = $row->getCellIterator();
                                $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                                foreach ($cellIterator as $cell) {
                                    array_push($rowData, $cell->getValue());
                                }
                                array_push($financialStatementData, $rowData);
                            }
                            $i++;
                        }
                        if (empty($financialStatementData[10][12])) {
                            $responseData->Status = 0;
                            $responseData->Message = "You have uploaded a document which have missing information related to Retail Net Increased Access Dollars. Please re-check the document and re-upload or fill in the data for two following fields.";
                            return json_encode($responseData);
                        } else {
                            if ($input['is_base_line'] == 1) {
                                $delete = FinancialStatement::where('is_base_line', 1)->where('hcf_id', $user->health_care_facility_id)->delete();
                                $financialStatement = new FinancialStatement();
                                $financialStatement->total_estimated_340b_cost = -($financialStatementData[0][4] + $financialStatementData[1][4] + $financialStatementData[2][4] + $financialStatementData[3][4]);
                                $financialStatement->reconciliation = -$financialStatementData[8][12];
                                $financialStatement->is_base_line = 1;
                                $financialStatement->retail_net_increased_access_dollars = $financialStatementData[10][12];
                                $financialStatement->hcf_id = $user->health_care_facility_id;
                                $financialStatement->save();
                                $report = Report::where('is_base_line', 1)->where('hcf_id', $user->health_care_facility_id)->first();
                                if (empty($report)) {
                                    $report = new Report();
                                }
                                $report->financial_url = $financialUrl;
                                $report->hcf_id = $user->health_care_facility_id;
                                $report->date = $timeFrame;
                                $report->submitted_by = $user->id;
                                $report->is_base_line = 1;
                                $report->save();
                            } else {
                                $checFinancialStatement = FinancialStatement::where('time', $timeFrame)->where('hcf_id', $user->health_care_facility_id)->first();
                                if (!empty($checFinancialStatement)) {
                                    //delete Rx Detail if exist
                                    FinancialStatement::where('time', $timeFrame)->where('hcf_id', $user->health_care_facility_id)->delete();
                                }
                                // add to financial statement
                                $financialStatement = new FinancialStatement();
                                $financialStatement->total_estimated_340b_cost = -($financialStatementData[0][4] + $financialStatementData[1][4] + $financialStatementData[2][4] + $financialStatementData[3][4]);
                                $financialStatement->reconciliation = -$financialStatementData[8][12];
                                $financialStatement->time = $timeFrame;
                                if (empty($input['retail_net_increased_access_dollars'])) {
                                    $financialStatement->retail_net_increased_access_dollars = $financialStatementData[10][12];
                                } else {
                                    $financialStatement->retail_net_increased_access_dollars = $input['retail_net_increased_access_dollars'];
                                }
                                $financialStatement->hcf_id = $user->health_care_facility_id;
                                $financialStatement->save();
                                $report = Report::where('date', $timeFrame)->where('is_base_line', 0)->where('hcf_id', $user->health_care_facility_id)->first();
                                if (empty($report)) {
                                    $report = new Report();
                                }
                                $report->financial_url = $financialUrl;
                                $report->hcf_id = $user->health_care_facility_id;
                                $report->date = $timeFrame;
                                $report->submitted_by = $user->id;
                                $report->save();
                            }
                        }
                        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                    }
                }
            } else {
                if ($input['file']->getClientOriginalName()) {
                    $emrExtension = $input['file']->getClientOriginalExtension();
                    if ($emrExtension != 'csv' && $emrExtension != 'xls' && $emrExtension != 'xlsx') {
                        $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
                        $responseData->Message = Constants::RESPONSE_MESSAGE_INVALID_INPUT;
                        return json_encode($responseData);
                    } else {
                        $emrFileName = str_random(6) . time() . uniqid() . '.' . $emrExtension;
                        $emrUrl = Constants::REPORT_UPLOAD_URL . $emrFileName;
                        $input['file']->move(public_path(Constants::REPORT_UPLOAD_URL), $emrFileName);

                        //read emr file and push data to array
                        $tmpfname = public_path(Constants::REPORT_UPLOAD_URL) . $emrFileName;
                        $file = fopen(public_path(Constants::REPORT_UPLOAD_URL) . $emrFileName, "r");
                        $excelReader = PHPExcel_IOFactory::createReaderForFile($tmpfname);
                        $excelObj = $excelReader->load($tmpfname);
                        $emr = $excelObj->getSheet(0);
                        $emrData = array();
                        $i = 0;
                        foreach ($emr->getRowIterator() AS $row) {
                            if ($i > 0) {
                                $rowData = array();
                                $cellIterator = $row->getCellIterator();
                                $cellIterator->setIterateOnlyExistingCells(FALSE); // This loops through all cells,
                                foreach ($cellIterator as $cell) {
                                    array_push($rowData, trim($cell->getValue()));
                                }
                                array_push($emrData, $rowData);
                            }
                            $i++;
                        }

                        $listRequired = array("Pharmacy Name", "Store Number", "Address", "City", "State", "ZipCode", "340B Contracted (Y/N)", "Rx Count");
                        foreach ($listRequired as $key => $value) {
                            if (!in_array(trim($value), $emrData[0])) {
                                $responseData->Status = 1;
                                $responseData->Message = "You have uploaded a document which have missing information related to " . $value . ". Please re-check the document and re-upload.";
                                return json_encode($responseData);
                            }
                        }
                        $checkEmrDetail = Emr::where('time', $timeFrame)->first();
                        if (!empty($checkEmrDetail)) {
                            //delete Rx Detail if exist
                            Emr::where('time', $timeFrame)->delete();
                        }

                        //import data to database
                        $i = 0;
                        foreach ($emrData as $key => $value) {
                            if ($i > 0) {
                                $address = $value[2] . ', ' . $value[3] . ',' . $value[4] . ', ' . 'US'; // Google HQ
                                $prepAddr = str_replace(' ', '+', $address);
                                $geocode = file_get_contents('https://maps.google.com/maps/api/geocode/json?key=' . Constants::GEO_API_KEY . '&address=' . $prepAddr . '&sensor=false');
                                $output = json_decode($geocode);
                                $latitude = $output->results[0]->geometry->location->lat;
                                $longitude = $output->results[0]->geometry->location->lng;
                                $emrObj = new Emr();
                                $emrObj->pharmacy_name = $value[0];
                                $emrObj->store_number = $value[1];
                                $emrObj->latitude = $latitude;
                                $emrObj->longitude = $longitude;
                                $emrObj->address = $value[2];
                                $emrObj->city = $value[3];
                                $emrObj->state = $value[4];
                                $emrObj->zip = $value[5];
                                $emrObj->contracted = ($value[6] == 'Y') ? 1 : 0;
                                $emrObj->rx_count = $value[7];
                                $emrObj->time = $timeFrame;
                                $emrObj->hcf_id = $user->health_care_facility_id;
                                $emrObj->save();
                            }
                            $i++;
                        }
                        $report = Report::where('is_base_line', 1)->where('hcf_id', $user->health_care_facility_id)->first();
                        if (empty($report)) {
                            $report = new Report();
                        }
                        $report->hcf_id = $user->health_care_facility_id;
                        $report->emr_url = $emrUrl;
                        $report->date = $timeFrame;
                        $report->submitted_by = $user->id;
                        $report->save();
                    }
                }
            }
        }
        return json_encode($responseData);
    }

    public function GetProviderData(Request $request)
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $input = $request->all();
        $responseData = new Response();
        $validator = Validator::make($input, [
            "from_date" => 'required',
            "date_range" => 'required'
        ]);
        if ($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            $input['to_date'] = date("Y-m-d", strtotime($input['from_date'] . ' +' . $input['date_range'] . ' months'));
            $data = objectValue();
            $checkData = DB::table('rx_details')->whereBetween('time', [$input['from_date'], $input['to_date']])->where('hcf_id', $user->health_care_facility_id)->first();
            if (empty($checkData)) {
                $data->revenueData = objectValue();
                $data->prescriberData = array();
                $data->patientSavingData = array();
                $data->totalRx = array();
                $data->pharmacyData = array();
            } else {
                $totalRevenueData = array();
                $netRevenueData = array();
                $baseLine = objectValue();
                $baseLine->net_revenue = 0;
                $baseLine->retail_net_increased_access_dollars = 0;
                $baseLine->time = 0;
                $netRevenueData = $totalRevenueData = DB::table('financial_statement')->select(DB::raw('retail_net_increased_access_dollars - total_estimated_340b_cost as net_revenue,retail_net_increased_access_dollars , DATE_FORMAT(time,"%Y-%m") as time, id'))->whereBetween('time', [$input['from_date'], $input['to_date']])->orderBy('time')->where('hcf_id', $user->health_care_facility_id)->get();
                $averageTotalRevenue = DB::table('financial_statement')->whereBetween('time', [$input['from_date'], $input['to_date']])->orderBy('time')->where('hcf_id', $user->health_care_facility_id)->avg('retail_net_increased_access_dollars');
                $averageTotalRevenue = number_format($averageTotalRevenue, 2);
                $averageNetRevenueData = DB::table('financial_statement')->select(DB::raw('retail_net_increased_access_dollars - total_estimated_340b_cost as net_revenue'))->whereBetween('time', [$input['from_date'], $input['to_date']])->orderBy('time')->where('hcf_id', $user->health_care_facility_id)->get();
                $totalNetRevenue = 0;
                foreach ($averageNetRevenueData as $key => $value) {
                    $totalNetRevenue += $value->net_revenue;
                }
                $monthNumber = count($averageNetRevenueData);
                $averageNetRevenue = number_format($totalNetRevenue / $monthNumber, 2);
                $baseLineData = DB::table('financial_statement')->select(DB::raw('id, retail_net_increased_access_dollars-total_estimated_340b_cost as net_revenue, retail_net_increased_access_dollars, time'))->where('is_base_line', 1)->where('hcf_id', $user->health_care_facility_id)->first();
                if (!empty($baseLineData)) {
                    $baseLine = $baseLineData;
                }
                array_unshift($totalRevenueData, $baseLine);
                array_unshift($netRevenueData, $baseLine);
                $prescriberData = DB::select("SELECT id,prescriber_name as prescriberName, SUM(rx_claim_sold) as totalRx,  
                            (SELECT  SUM(rx_claim_sold) FROM rx_details WHERE prescriber_name = prescriberName AND time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "' AND claim_type = 'Uninsured') as Uninsured,
                            (SELECT  SUM(rx_claim_sold) FROM rx_details WHERE prescriber_name = prescriberName AND time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "' AND claim_type = 'Insured') as Insured,
                            (SELECT  SUM(est_awp_cost - copay_amt) FROM rx_details WHERE prescriber_name = prescriberName AND time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "' AND claim_type = 'Uninsured') as patientSaving,
                            (SELECT  SUM(increased_access_dollars) FROM rx_details WHERE prescriber_name = prescriberName AND time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "') as totalRevenue
                            FROM rx_details 
                            WHERE time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "'
                            AND rx_details.hcf_id = " . $user->health_care_facility_id . "
                            GROUP BY prescriberName");
                foreach ($prescriberData as $key => $value) {
                    $value->Uninsured = (int)$value->Uninsured;
                    $value->Insured = (int)$value->Insured;
                    $value->totalRx = (int)$value->totalRx;
                    $value->patientSaving = (float)$value->patientSaving;
                    $value->totalRevenue = (float)$value->totalRevenue;
                }
                $patientSavingData = DB::select("SELECT SUM(est_awp_cost-copay_amt) as totalPatientSaving, SUM(est_awp_cost-copay_amt)/ COUNT(id) as Average
                            FROM rx_details 
                            WHERE time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "'
                             AND claim_type = 'Uninsured'
                             AND rx_details.hcf_id = " . $user->health_care_facility_id . "
                            ");
                $patientSavingData = $patientSavingData[0];
                $totalRx = DB::select("SELECT SUM(rx_claim_sold) as totalRx, SUM(increased_access_dollars) as totalRevenue
                            FROM rx_details 
                            WHERE time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "'
                            AND rx_details.hcf_id = " . $user->health_care_facility_id . "
                            ");
                $totalRx = $totalRx[0];
                $pharmacyData = DB::select("SELECT pharmacy_location, pharmacy,SUM(rx_claim_sold) as rxClaimSold,SUM(rx_claim_sold) * 100/" . $totalRx->totalRx . " as percent
                            FROM rx_details 
                            WHERE time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "'
                            AND rx_details.hcf_id = " . $user->health_care_facility_id . "
                            GROUP BY pharmacy_location 
                            ORDER BY percent desc
                            ");
                $data->totalRevenueData = $totalRevenueData;
                $data->averageTotalRevenue = $averageTotalRevenue;
                $data->averageNetRevenue = $averageNetRevenue;
                $data->monthNumber = $monthNumber;
                $data->netRevenueData = $netRevenueData;
                $data->prescriberData = $prescriberData;
                $data->patientSavingData = $patientSavingData;
                $data->totalRx = $totalRx;
                $data->pharmacyData = $pharmacyData;
            }
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            $responseData->Data = $data;
        }
        return json_encode($responseData);
    }

    public function GetPharmacyData(Request $request)
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $input = $request->all();
        $responseData = new Response();
        $validator = Validator::make($input, [
            "from_date" => 'required',
            "date_range" => 'required'
        ]);
        if ($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            $input['to_date'] = date("Y-m-d", strtotime($input['from_date'] . ' +' . $input['date_range'] . ' months'));
            $data = DB::select("SELECT SUM(copay_amt - est_awp_cost) as totalPatientSaving, SUM(copay_amt - est_awp_cost)/ COUNT(id) as Average
                            FROM rx_details 
                            WHERE time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "'
                            AND claim_type = 'Uninsured'
                            AND rx_details.hcf_id = " . $user->health_car_facility_id . "
                            ");
            $totalRx = DB::select("SELECT SUM(rx_claim_sold) as totalRx, SUM(increased_access_dollars) as totalRevenue
                            FROM rx_details 
                            WHERE time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "'
                            AND rx_details.hcf_id = " . $user->health_car_facility_id . "
                            ");
            $pharmacyData = DB::select("SELECT pharmacy_location, pharmacy,SUM(rx_claim_sold) as rxClaimSold,SUM(rx_claim_sold) * 100/" . $totalRx[0]->totalRx . " as percent
                            FROM rx_details 
                            WHERE time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "'
                            AND rx_details.hcf_id = " . $user->health_car_facility_id . "
                            GROUP BY pharmacy_location 
                            ORDER BY percent desc
                            ");
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            $responseData->Data = $data;
        }
        return json_encode($responseData);
    }

    public function GetUploadHistory()
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response();
        $uploadHistory = DB::table('report')
            ->select('report.*', 'user.full_name as fullname')
            ->join('user', 'user.id', '=', 'report.submitted_by')
            ->where('hcf_id', $user->health_care_facility_id)
            ->where('is_base_line',0)
            ->orderBy('report.date')
            ->orderBy('report.created_at')
            ->get();
        $data = array();
        $historyLength = count($uploadHistory);
        for ($i = 0; $i < $historyLength; $i++) {
            $uploadHistory[$i]->date = date("Y-m", strtotime($uploadHistory[$i]->date));
            if ($i == 0) {
                array_push($data, $uploadHistory[$i]);
            } else {
                $d1 = new DateTime($uploadHistory[$i]->date);
                $d2 = new DateTime($uploadHistory[$i - 1]->date);
                $interval = date_diff($d1, $d2);
                $interval = $interval->y * 12 + $interval->m;
                for ($j = 1; $j < $interval; $j++) {
                    $monthlyData = objectValue();
                    $monthlyData->date = date("Y-m", strtotime($uploadHistory[$i - 1]->date . '+ ' . $j . ' month'));
                    array_push($data, $monthlyData);
                }
                array_push($data, $uploadHistory[$i]);

            }
        }
        $baseLine = DB::table('report')
            ->select('report.*', 'user.full_name as fullname')
            ->join('user', 'user.id', '=', 'report.submitted_by')
            ->where('hcf_id', $user->health_care_facility_id)
            ->where('is_base_line',1)
            ->first();
        if(!empty($baseLine)) {
            $baseLine->date = date("Y-m",strtotime($baseLine->date));
            array_unshift($data,$baseLine);
        }
        $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        $responseData->Data = $data;
        return json_encode($responseData);
    }

    public function GetEmrData(Request $request)
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response();
        $input = $request->all();
        $validator = Validator::make($input, [
            'from_date' => 'required',
            'date_range' => 'required'
        ]);
        if ($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            $input['to_date'] = date("Y-m-d", strtotime($input['from_date'] . ' +' . $input['date_range'] . ' months'));
            $data = objectValue();
            $checkData = DB::table('rx_details')->whereBetween('time', [$input['from_date'], $input['to_date']])->where('hcf_id', $user->health_care_facility_id)->first();
            if (empty($checkData)) {
                $data->contracted = 0;
                $data->Noncontracted = 0;
                $data->pharmacyBreakdown = array();
                $data->pharmacySumary = array();
            } else {
                $contracted = DB::table('emr_details')->where('contracted', 1)->where('time', '>=', $input['from_date'])->where('time', '<=', $input['to_date'])->where('hcf_id', $user->health_care_facility_id)->sum('rx_count');
                $Noncontracted = DB::table('emr_details')->where('contracted', 0)->where('time', '>=', $input['from_date'])->where('time', '<=', $input['to_date'])->where('hcf_id', $user->health_care_facility_id)->sum('rx_count');
                $pharmacyBreakdown = DB::select("SELECT pharmacy_name as pharmacy,
                                                  (SELECT SUM(rx_count) FROM emr_details WHERE contracted = 1 AND pharmacy_name = pharmacy AND time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "' ) as Contracted,
                                                  (SELECT SUM(rx_count) FROM emr_details WHERE contracted = 0 AND pharmacy_name = pharmacy AND time BETWEEN '" . $input['from_date'] . "' AND '" . $input['to_date'] . "' ) as NonContracted
                                                  FROM emr_details
                                                  WHERE emr_details.hcf_id = " . $user->health_care_facility_id . "
                                                  GROUP BY pharmacy_name
                                                  ORDER BY Contracted, NonContracted");
                $pharmacyBreakdownData = array();
                foreach ($pharmacyBreakdown as $key => $value) {
                    $contractedObj = objectValue();
                    $contractedObj->pharmacy = $value->pharmacy . " Contracted";
                    $contractedObj->y = (int)($value->Contracted);
                    array_push($pharmacyBreakdownData, $contractedObj);
                    $NonContractedObj = objectValue();
                    $NonContractedObj->pharmacy = $value->pharmacy . " NonContracted";
                    $NonContractedObj->y = (int)($value->NonContracted);
                    array_push($pharmacyBreakdownData, $NonContractedObj);
                }
                $pharmacySumary = DB::select("SELECT pharmacy_name as pharmacy, 
                                              SUM(rx_count) as total 
                                              FROM emr_details 
                                              WHERE emr_details.hcf_id = " . $user->health_care_facility_id . "
                                              GROUP BY pharmacy_name");
                foreach ($pharmacySumary as $key => $value) {
                    $value->listStore = DB::table('emr_details')->select('rx_count as qty', 'address', 'city', 'contracted')->where('pharmacy_name', $value->pharmacy)->where('hcf_id', $user->health_care_facility_id)->get();
                }
                $data->contracted = $contracted;
                $data->Noncontracted = $Noncontracted;
                $data->pharmacyBreakdown = $pharmacyBreakdownData;
                $data->pharmacySumary = $pharmacySumary;
                $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
                $responseData->Data = $data;
            }
        }
        return json_encode($responseData);
    }

    public function GetPharmacyHeatMap(Request $request)
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response();
        $input = $request->all();
        $validator = Validator::make($input, [
            'from_date' => 'required',
            'date_range' => 'required'
        ]);
        if ($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            $input['to_date'] = date("Y-m-d", strtotime($input['from_date'] . ' +' . $input['date_range'] . ' months'));
            $listPharmacy = DB::table('emr_details')->select(DB::raw("emr_details.*,'" . Constants::API_URL . Constants::IMAGES . Constants::PHARMACY_IMAGE_URL . '1508287724Walgreen 1.jpg' . "' as logo"))->where('time', '>=', $input['from_date'])->where('time', '<=', $input['to_date'])->where('hcf_id', $user->health_care_facility_id)->get();
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
            $responseData->Data = $listPharmacy;
        }
        return json_encode($responseData);
    }

    public function DeleteReportDataByMonth(Request $request)
    {
        $user = $_SESSION[Constants::SESSION_KEY_USER];
        $responseData = new Response();
        $input = $request->all();
        $validator = Validator::make($input, [
            'timeframe' => 'required'
        ]);
        if ($validator->fails()) {
            $responseData->Status = Constants::RESPONSE_STATUS_ERROR;
            $responseData->Message = $validator->errors()->first();
        } else {
            $timeframe = date("Y-m-d H:i:s", strtotime($input['timeframe']));
            //delete report history
            $report = Report::where('date', $timeframe)->where('hcf_id', $user->health_care_facility_id)->delete();
            //delete financial
            $financialStatement = FinancialStatement::where('time', $timeframe)->where('is_base_line', 0)->where('hcf_id', $user->health_care_facility_id)->delete();
            //delete emr
            $emr = Emr::where('time', $timeframe)->where('hcf_id', $user->health_care_facility_id)->delete();
            //delete rx details
            $rxDetail = RxDetails::where('time', $timeframe)->where('hcf_id', $user->health_care_facility_id)->delete();
            $responseData->Status = Constants::RESPONSE_STATUS_SUCCESS;
        }
        return json_encode($responseData);
    }
}
