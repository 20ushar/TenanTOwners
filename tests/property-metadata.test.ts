import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  buildMissingPropertyMetadata,
  buildPropertyMetadata,
  injectSocialMetadata,
  isPublicHttpsImageUrl,
  renderSocialMetadata,
} from '../src/server/propertyMetadata.ts';

test('renders property-specific metadata with an absolute image and canonical URL', () => {
  const metadata = buildPropertyMetadata({
    id: 'prop_123',
    title: '3 BHK in Mahagun Mywoods',
    description: 'A bright, ready-to-move flat near the park.',
    listing_type: 'rent',
    price: 25000,
    location: 'Gaur City 2, Noida Extension',
    society: 'Mahagun Mywoods',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/property.jpg',
  });
  const html = renderSocialMetadata(metadata);

  assert.match(html, /<title>3 BHK in Mahagun Mywoods \| TenanTOwners<\/title>/);
  assert.match(html, /Mahagun Mywoods/);
  assert.match(html, /₹25,000\/month/);
  assert.match(html, /property="og:image" content="https:\/\/res\.cloudinary\.com\/demo\/image\/upload\/property\.jpg"/);
  assert.match(html, /property="og:url" content="https:\/\/tenantowners\.in\/property\/prop_123"/);
  assert.match(html, /rel="canonical" href="https:\/\/tenantowners\.in\/property\/prop_123"/);
});

test('uses the branded fallback for a property without a valid public image', () => {
  const metadata = buildPropertyMetadata({
    id: 'prop_no_image',
    title: 'Property without image',
    location: 'Noida',
    imageUrl: 'http://localhost/private.jpg',
  });

  assert.equal(metadata.imageUrl, 'https://tenantowners.in/tenantowners-social-fallback.png');
});

test('rejects private, non-HTTPS and expiring signed image URLs', () => {
  assert.equal(isPublicHttpsImageUrl('http://cdn.example.com/property.jpg'), false);
  assert.equal(isPublicHttpsImageUrl('https://localhost/property.jpg'), false);
  assert.equal(isPublicHttpsImageUrl('https://storage.example.com/property.jpg?X-Amz-Expires=300'), false);
  assert.equal(isPublicHttpsImageUrl('https://res.cloudinary.com/site/image/upload/property.jpg'), true);
});

test('escapes database content before inserting it into HTML', () => {
  const html = renderSocialMetadata(buildPropertyMetadata({
    id: 'prop_xss',
    title: '"><script>alert(1)</script>Safe title',
    description: '<img src=x onerror=alert(1)> Description & details',
    location: 'Noida',
  }));

  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&quot;&gt; alert\(1\) Safe title/);
  assert.match(html, /Description &amp; details/);
});

test('injects missing-property metadata and noindex into the real app template', () => {
  const template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const html = injectSocialMetadata(template, buildMissingPropertyMetadata('missing_property'));

  assert.match(html, /Property Not Found \| TenanTOwners/);
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.match(html, /property="og:url" content="https:\/\/tenantowners\.in\/property\/missing_property"/);
  assert.equal((html.match(/property="og:title"/g) || []).length, 1);
});
