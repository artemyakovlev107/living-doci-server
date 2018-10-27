<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Emr extends Model
{
    protected $table = 'emr_details';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [];
    public $timestamps = true;
}
