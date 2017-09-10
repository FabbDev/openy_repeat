<?php

namespace Drupal\geolocation;

use Drupal\Component\Plugin\PluginInspectionInterface;

/**
 * Defines an interface for geolocation MapProvider plugins.
 */
interface MapProviderInterface extends PluginInspectionInterface {

  /**
   * Provide a populated settings array.
   *
   * @return array
   *   The settings array with the default map settings.
   */
  public static function getDefaultSettings();

  /**
   * Provide map provider specific settings ready to handover to JS.
   *
   * @param array $settings
   *   Current general map settings. Might contain unrelated settings as well.
   *
   * @return array
   *   An array only containing keys defined in this plugin.
   */
  public function getSettings(array $settings);

  /**
   * Provide a summary array to use in field formatters.
   *
   * @param array $settings
   *   The current map settings.
   *
   * @return array
   *   An array to use as field formatter summary.
   */
  public function getSettingsSummary(array $settings);

  /**
   * Provide a generic map settings form array.
   *
   * @param array $settings
   *   The current map settings.
   * @param array $parents
   *   Form parents.
   *
   * @return array
   *   A form array to be integrated in whatever.
   */
  public function getSettingsForm(array $settings, array $parents);

  /**
   * Return all Drupal render attachments required by this map provider.
   *
   * @param array $settings
   *   The current map settings.
   *
   * @return array
   *   Render attachments.
   */
  public function attachments(array $settings);

}