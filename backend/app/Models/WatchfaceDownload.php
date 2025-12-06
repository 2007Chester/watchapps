<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WatchfaceDownload extends Model
{
    protected $fillable = [
        'watchface_id',
        'user_id',
        'watchface_file_id',
        'ip',
        'user_agent',
    ];

    public function watchface()
    {
        return $this->belongsTo(Watchface::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function watchfaceFile()
    {
        return $this->belongsTo(WatchfaceFile::class);
    }
}
