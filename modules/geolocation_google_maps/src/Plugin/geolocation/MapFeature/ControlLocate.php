<?php

namespace Drupal\geolocation_google_maps\Plugin\geolocation\MapFeature;

use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Render\BubbleableMetadata;

/**
 * Provides Google Maps.
 *
 * @MapFeature(
 *   id = "control_locate",
 *   name = @Translation("Control Locate"),
 *   description = @Translation("Add button to center on client location."),
 *   type = "google_maps",
 * )
 */
class ControlLocate extends GoogleMapControlFeatureBase {

  /**
   * {@inheritdoc}
   */
  public function alterRenderArray(array $render_array, array $settings, $map_id = NULL) {
    $render_array = parent::alterRenderArray($render_array, $settings, $map_id);

    $render_array['#attached'] = BubbleableMetadata::mergeAttachments(
      empty($render_array['#attached']) ? [] : $render_array['#attached'],
      [
        'library' => [
          'geolocation_google_maps/geolocation.control_locate',
        ],
        'drupalSettings' => [
          'geolocation' => [
            'maps' => [
              $map_id => [
                'control_locate' => [
                  'enable' => TRUE,
                ],
              ],
            ],
          ],
        ],
      ]
    );

    $render_array['#controls'][$this->pluginId] = NestedArray::mergeDeep(
      $render_array['#controls'][$this->pluginId],
      [
        '#type' => 'html_tag',
        '#tag' => 'button',
        '#value' => $this->t('Locate'),
        '#attributes' => [
          'class' => ['locate'],
        ],
      ]
    );

    return $render_array;
  }

}