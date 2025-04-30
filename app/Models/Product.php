<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'category',
        'image_url',
    ];

    // Relationships
    public function orders()
    {
        return $this->belongsToMany(Order::class)->withPivot('quantity');
    }

    public function recommendations()
    {
        return $this->hasMany(Recommendation::class);
    }
}
