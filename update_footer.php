<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Setting;

$footerContent = [
    'aboutText' => 'Premium fashion brand delivering worldwide.',
    'customerCare' => [
        ['label' => 'Contact Us', 'link' => '/contact'],
        ['label' => 'Returns', 'link' => '/returns'],
        ['label' => 'FAQs', 'link' => '/faqs']
    ],
    'socialMedia' => [
        ['label' => 'Facebook', 'link' => 'https://facebook.com'],
        ['label' => 'Linkedin', 'link' => 'https://linkedin.com'],
        ['label' => 'Github', 'link' => 'https://github.com']
    ],
    'copyright' => '© 2026 EcomStack. All rights reserved.'
];

$setting = Setting::where('key', 'footer_content')->firstOrNew(['key' => 'footer_content']);
$setting->value = $footerContent;
$setting->save();

echo "Footer settings updated successfully!\n";
