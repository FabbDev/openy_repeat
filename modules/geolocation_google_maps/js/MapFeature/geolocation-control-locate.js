/**
 * @typedef {Object} ControlLocateSettings
 *
 * @property {String} enable
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Locate control.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches common map style functionality to relevant elements.
   */
  Drupal.behaviors.geolocationControlLocate = {
    attach: function (context, drupalSettings) {
      $.each(
        drupalSettings.geolocation.maps,

        /**
         * @param {String} mapId - ID of current map
         * @param {Object} mapSettings - settings for current map
         * @param {ControlLocateSettings} mapSettings.control_locate - settings for current map
         */
        function (mapId, mapSettings) {
          if (
            typeof mapSettings.control_locate !== 'undefined'
            && mapSettings.control_locate.enable
          ) {
            var map = Drupal.geolocation.getMapById(mapId);

            map.addReadyCallback(function (map) {
              var locateButton = $('button.locate', map.wrapper).first();
              if (navigator.geolocation) {
                locateButton.click(function () {
                  navigator.geolocation.getCurrentPosition(function (currentPosition) {
                    var currentLocation = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
                    map.addAccuracyIndicatorCircle(currentLocation, parseInt(currentPosition.coords.accuracy));
                  });
                });
                map.addControl(locateButton);
              }
            });
          }
        }
      );
    }
  };

})(jQuery, Drupal);
