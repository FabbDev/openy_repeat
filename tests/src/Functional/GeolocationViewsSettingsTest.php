<?php

namespace Drupal\Tests\geolocation\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Tests the Views integration of the Search API.
 *
 * @group search_api
 */
class GeolocationViewsSettingsTest extends BrowserTestBase {

  /**
   * Modules to enable for this test.
   *
   * @var string[]
   */
  public static $modules = [
    'node',
    'field',
    'views',
    'taxonomy',
    'geolocation',
    'geolocation_demo',
    'geolocation_google_maps',
    'geolocation_google_maps_demo',
    'views_ui',
  ];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Tests the Views admin UI and field handlers.
   */
  public function testViewsAdmin() {
    $permissions = [
      'access administration pages',
      'administer views',
    ];
    $admin_user = $this->drupalCreateUser($permissions);
    $this->drupalLogin($admin_user);

    $this->drupalGet('admin/structure/views/view/geolocation_demo_common_map');

    // Add click sorting for all fields where this is possible.
    $this->clickLink('Settings');
    $edit = [
      'style_options[centre][fit_bounds][enable]' => 1,
    ];
    $this->submitForm($edit, 'Apply');
  }

}
