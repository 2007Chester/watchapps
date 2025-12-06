<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WatchfaceRatingReply extends Model
{
    protected $fillable = [
        'rating_id',
        'developer_id',
        'reply',
    ];

    public function rating()
    {
        return $this->belongsTo(WatchfaceRating::class, 'rating_id');
    }

    public function developer()
    {
        return $this->belongsTo(User::class, 'developer_id');
    }
}
