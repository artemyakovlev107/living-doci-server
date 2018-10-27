<?php

namespace App\Http\Middleware;

use Closure;
use App\Constants\Constants;
use App\Models\Response;
use Session;
use DB;

class SessionAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $responseData = new Response;
        $arrInput = json_decode($request->getContent());
        isset($arrInput->loginToken) ? $loginToken = $arrInput->loginToken : $loginToken = $request->input('loginToken');
        if(!isset($_SESSION[Constants::SESSION_KEY_USER])) {
            if(!isset($loginToken)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ACCESS_IS_DENIED;
                $responseData->Data = array();
                return response()->json($responseData);
            } else {
                $user = DB::table('user')->where('login_token',$loginToken)->first();
                if(!empty($user)) {
                    if($user->role == Constants::USER) {
                        $responseData->Status = Constants::RESPONSE_STATUS_ACCESS_IS_DENIED;
                        $responseData->Data = array();
                        return response()->json($responseData);
                    } else {
                        $_SESSION[Constants::SESSION_KEY_USER] = $user;
                    } 
                } else {
                    $responseData->Status = Constants::RESPONSE_STATUS_ACCESS_IS_DENIED;
                    $responseData->Data = array();
                    return response()->json($responseData);
                }
            }
        } else {
            $user = $_SESSION[Constants::SESSION_KEY_USER];
            if($user->role == Constants::USER) {
                $responseData->Status = Constants::RESPONSE_STATUS_ACCESS_IS_DENIED;
                $responseData->Data = array();
                return response()->json($responseData);
            }
        }
        return $next($request);
    }
}
