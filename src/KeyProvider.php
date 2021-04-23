<?php

namespace Drupal\geolocation;

/**
 * Class KeyProvider.
 *
 * @package Drupal\geolocation
 */
class KeyProvider {

  /**
   * Get actual API key from key module, if possible.
   *
   * So that we don't need to store plain text api key secrets in config file.
   */
  public static function getKeyValue($key) {
    // If the "Key" module exists, assume we are storing the key name instead of
    // the actual value, which should be a secret not saved in config.
    if (\Drupal::moduleHandler()->moduleExists('key')) {
      $key = \Drupal::service('key.repository')
        ->getKey($key)
        ->getKeyValue();
    }
    // Without key module, fallback to the insecure way of storing api key in
    // config file.
    return $key;
  }

}
