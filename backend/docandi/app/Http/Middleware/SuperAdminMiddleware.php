<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Response;
use App\Constants\Constants;

class SuperAdminMiddleware
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
        $loginToken = $request->header('loginToken');
        if(!isset($_SESSION[Constants::SESSION_KEY_USER])) {
            if(!isset($loginToken)) {
                $responseData->Status = Constants::RESPONSE_STATUS_ACCESS_IS_DENIED;
                $responseData->Data = array();
                return response()->json($responseData);
            } else {
                $user = DB::table('user')->where('login_token',$loginToken)->first();
                if(!empty($user)) {
                    if($user->role != Constants::SUPER_ADMIN) {
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
            if($user->role != Constants::SUPER_ADMIN) {
                $responseData->Status = Constants::RESPONSE_STATUS_ACCESS_IS_DENIED;
                $responseData->Data = array();
                return response()->json($responseData);
            }
        }
        return $next($request);
    }
}
