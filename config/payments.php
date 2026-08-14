<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Active payment driver
    |--------------------------------------------------------------------------
    | 'sandbox' simulates the full card flow without credentials.
    | 'cmi'     -> Centre Monétique Interbancaire (Monetico)
    | 'cih'     -> CIH Bank (CIH PAY / VADS)
    */
    'driver' => env('PAYMENT_DRIVER', 'sandbox'),

    /*
    |--------------------------------------------------------------------------
    | Frontend origin
    |--------------------------------------------------------------------------
    | Used by the sandbox driver to build the hosted payment page URL.
    | In production the SPA is served from the same origin as the API.
    */
    'frontend_url' => env('FRONTEND_URL', env('APP_URL')),

    'sandbox' => [
        'hmac_secret' => env('PAYMENT_HMAC_SECRET', env('APP_KEY')),
    ],

    'cmi' => [
        'merchant_id' => env('CMI_MERCHANT_ID'),
        'store_key' => env('CMI_STORE_KEY'),
        'endpoint' => env('CMI_ENDPOINT', 'https://cmi.ma/secure/paymentgateway'),
    ],

    'cih' => [
        'merchant_id' => env('CIH_MERCHANT_ID'),
        'store_key' => env('CIH_STORE_KEY'),
        'endpoint' => env('CIH_ENDPOINT', 'https://www.cihpay.ma/vads/'),
    ],
];