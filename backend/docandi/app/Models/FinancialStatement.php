<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialStatement extends Model
{
    protected $table = 'financial_statement';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [];
    public $timestamps = true;
}
