<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "EcommercePro API",
    version: "1.0.0",
    description: "API Documentation for the EcommercePro project"
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: "Demo API Server"
)]
#[OA\SecurityScheme(
    type: "http",
    securityScheme: "sanctum",
    scheme: "bearer",
    bearerFormat: "JWT"
)]
abstract class Controller
{
    //
}
