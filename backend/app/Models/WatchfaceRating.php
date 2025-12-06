<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WatchfaceRating extends Model
{
    protected $fillable = [
        'watchface_id',
        'user_id',
        'rating',
        'comment',
        'ip',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function watchface()
    {
        return $this->belongsTo(Watchface::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(WatchfaceRatingReply::class, 'rating_id');
    }

    public function reply()
    {
        return $this->hasOne(WatchfaceRatingReply::class, 'rating_id');
    }
}
