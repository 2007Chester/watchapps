<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailVerificationToken extends Model
{
    protected $fillable = [
        'user_id',
        'token',
        'created_at',
    ];

    // Используем только created_at, без updated_at
    public $timestamps = false;
    
    // Преобразуем created_at в Carbon при получении
    protected $dates = ['created_at'];
    
    // Устанавливаем created_at при создании, если не указано
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (!$model->created_at) {
                $model->created_at = now();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
