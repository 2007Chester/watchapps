<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name', 'slug', 'sort_order'
    ];

    public function watchfaces()
    {
        return $this->belongsToMany(Watchface::class, 'watchface_category');
    }
}
