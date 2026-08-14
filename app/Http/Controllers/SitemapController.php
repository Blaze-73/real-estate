<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Response;
use SimpleXMLElement;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $baseUrl = rtrim(config('app.url'), '/');

        $staticUrls = [
            ['', '1.0', 'daily'],
            ['properties', '0.8', 'daily'],
            ['about', '0.6', 'monthly'],
            ['contact', '0.6', 'monthly'],
        ];

        $xml = new SimpleXMLElement(
            '<?xml version="1.0" encoding="UTF-8"?>'
            . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
        );

        foreach ($staticUrls as [$path, $priority, $changefreq]) {
            $url = $xml->addChild('url');
            $url->addChild('loc', $baseUrl . '/' . $path);
            $url->addChild('changefreq', $changefreq);
            $url->addChild('priority', $priority);
        }

        Property::available()
            ->orderBy('updated_at', 'desc')
            ->get()
            ->each(function (Property $property) use ($xml, $baseUrl) {
                $url = $xml->addChild('url');
                $url->addChild('loc', $baseUrl . '/properties/' . $property->slug);
                $url->addChild('lastmod', $property->updated_at?->toDateString());
                $url->addChild('changefreq', 'weekly');
                $url->addChild('priority', '0.7');
            });

        return response($xml->asXML(), 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
        ]);
    }

    public function robots(): Response
    {
        $baseUrl = rtrim(config('app.url'), '/');

        $content = implode("\n", [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /api/',
            'Disallow: /login',
            '',
            "Sitemap: {$baseUrl}/sitemap.xml",
            '',
        ]);

        return response($content, 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
        ]);
    }
}
