<?php

namespace Drupal\geolocation_google_maps\Plugin\geolocation\MapFeature;

use Drupal\geolocation\MapFeatureBase;
use Drupal\Core\Render\BubbleableMetadata;

/**
 * Provides Google Maps.
 *
 * @MapFeature(
 *   id = "marker_infowindow",
 *   name = @Translation("Marker InfoWindow"),
 *   description = @Translation("Open InfoWindow on Marker click."),
 *   type = "google_maps",
 * )
 */
class GoogleMarkerInfoWindow extends MapFeatureBase {

  /**
   * {@inheritdoc}
   */
  public static function getDefaultSettings() {
    return [
      'info_auto_display' => FALSE,
      'disable_auto_pan' => TRUE,
      'info_window_solitary' => TRUE,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getSettingsSummary(array $settings) {
    $summary = [];
    $summary[] = $this->t('InfoWindow enabled');

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function getSettingsForm(array $settings, array $parents) {
    $settings = $this->getSettings($settings);

    $form['info_window_solitary'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Only allow one current open info window.'),
      '#description' => $this->t('If checked, clicking a marker will close the current info window before opening a new one.'),
      '#default_value' => $settings['info_window_solitary'],
    ];

    $form['info_auto_display'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Automatically show info text.'),
      '#default_value' => $settings['info_auto_display'],
    ];
    $form['disable_auto_pan'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Disable automatic panning of map when info bubble is opened.'),
      '#default_value' => $settings['disable_auto_pan'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function alterRenderArray(array $render_array, array $settings, $map_id = NULL) {
    $render_array = parent::alterRenderArray($render_array, $settings, $map_id);

    $settings = $this->getSettings($settings);

    $render_array['#attached'] = BubbleableMetadata::mergeAttachments(
      empty($render_array['#attached']) ? [] : $render_array['#attached'],
      [
        'library' => [
          'geolocation_google_maps/geolocation.markerinfowindow',
        ],
        'drupalSettings' => [
          'geolocation' => [
            'maps' => [
              $map_id => [
                'marker_infowindow' => [
                  'enable' => TRUE,
                  'infoAutoDisplay' => $settings['info_auto_display'],
                  'disableAutoPan' => $settings['disable_auto_pan'],
                  'infoWindowSolitary' => $settings['info_window_solitary'],
                ],
              ],
            ],
          ],
        ],
      ]
    );

    return $render_array;
  }

}
