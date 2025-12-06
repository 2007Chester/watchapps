<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Watchface extends Model
{
    protected $fillable = [
        'developer_id',
        'title',
        'slug',
        'description',
        'price',
        'discount_price',
        'discount_start_at',
        'discount_end_at',
        'is_free',
        'version',
        'min_sdk',
        'target_sdk',
        'max_sdk',
        'wear_os_version',
        'package_name',
        'type',
        'status',
    ];

    protected $casts = [
        'is_free'         => 'boolean',
        'discount_start_at' => 'datetime',
        'discount_end_at' => 'datetime',
    ];

    public function files()
    {
        return $this->hasMany(WatchfaceFile::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'watchface_category');
    }

    public function sales()
    {
        return $this->hasMany(WatchfaceSale::class);
    }

    public function views()
    {
        return $this->hasMany(WatchfaceView::class);
    }

    public function downloads()
    {
        return $this->hasMany(WatchfaceDownload::class);
    }

    public function ratings()
    {
        return $this->hasMany(WatchfaceRating::class);
    }
}
