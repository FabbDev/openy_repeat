/**
 * @file
 * Handle the common map.
 */

/**
 * @name CommonMapUpdateSettings
 * @property {String} enable
 * @property {String} hide_form
 * @property {number} views_refresh_delay
 * @property {String} update_view_id
 * @property {String} update_view_display_id
 * @property {String} boundary_filter
 * @property {String} parameter_identifier
 */

/**
 * @name CommonMapSettings
 * @property {Object} settings
 * @property {GoogleMapSettings} settings.google_map_settings
 * @property {CommonMapUpdateSettings} dynamic_map
 * @property {String} client_location.enable
 * @property {String} client_location.update_map
 * @property {Boolean} showRawLocations
 * @property {Boolean} markerScrollToResult
 * @property {String} markerClusterer.enable
 * @property {String} markerClusterer.imagePath
 * @property {Object} markerClusterer.styles
 * @property {String} contextPopupContent.enable
 * @property {String} contextPopupContent.content
 */

/**
 * @property {CommonMapSettings[]} drupalSettings.geolocation.commonMap
 */

/**
 * @property {function(CommonMapUpdateSettings)} GeolocationMapSettings.updateDrupalView
 */

(function ($, window, Drupal, drupalSettings) {
  'use strict';

  var skipMapIdleEventHandler = false; // Setting to true will skip the next triggered map related viewsRefresh.

  /**
   * @namespace
   */
  Drupal.geolocation = Drupal.geolocation || {};

  /**
   * Attach common map style functionality.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches common map style functionality to relevant elements.
   */
  Drupal.behaviors.geolocationCommonMap = {
    attach: function (context, drupalSettings) {
      $.each(
        drupalSettings.geolocation.commonMap,

        /**
         * @param {String} mapId - canvasId of current map
         * @param {CommonMapSettings} commonMapSettings - settings for current map
         */
        function (mapId, commonMapSettings) {

          /*
           * Hide form if requested.
           */
          if (
            typeof commonMapSettings.dynamic_map !== 'undefined'
            && commonMapSettings.dynamic_map.enable
            && commonMapSettings.dynamic_map.hide_form
            && typeof commonMapSettings.dynamic_map.parameter_identifier !== 'undefined'
          ) {
            var exposedForm = $('form#views-exposed-form-' + commonMapSettings.dynamic_map.update_view_id.replace(/_/g, '-') + '-' + commonMapSettings.dynamic_map.update_view_display_id.replace(/_/g, '-'));

            if (exposedForm.length === 1) {
              exposedForm.find('input[name^="' + commonMapSettings.dynamic_map.parameter_identifier + '"]').each(function (index, item) {
                $(item).parent().hide();
              });

              // Hide entire form if it's empty now, except form-submit.
              if (exposedForm.find('input:visible:not(.form-submit), select:visible').length === 0) {
                exposedForm.hide();
              }
            }
          }

          var map = Drupal.geolocation.getMapById(mapId);

          // Hide the graceful-fallback HTML list; map will propably work now.
          // Map-container is not hidden by default in case of graceful-fallback.
          if (typeof commonMapSettings.showRawLocations === 'undefined') {
            map.wrapper.children('.geolocation-map-locations').hide();
          }
          else if (!commonMapSettings.showRawLocations) {
            map.wrapper.children('.geolocation-map-locations').hide();
          }

          /*
           * Update existing map, depending on present data-attribute settings.
           */
          if (map.wrapper.hasClass('geolocation-map-processed')) {
            if (map.wrapper.data('centre-lat') && map.wrapper.data('centre-lng')) {
              var newCenter = new google.maps.LatLng(
                map.wrapper.data('centre-lat'),
                map.wrapper.data('centre-lng')
              );

              if (!map.googleMap.getCenter().equals(newCenter)) {
                skipMapIdleEventHandler = true;
                map.setCenterByCoordinates(newCenter);
              }
            }
            else if (
              map.wrapper.data('centre-lat-north-east')
              && map.wrapper.data('centre-lng-north-east')
              && map.wrapper.data('centre-lat-south-west')
              && map.wrapper.data('centre-lng-south-west')
            ) {
              var newBounds = {
                north: map.wrapper.data('centre-lat-north-east'),
                east: map.wrapper.data('centre-lng-north-east'),
                south: map.wrapper.data('centre-lat-south-west'),
                west: map.wrapper.data('centre-lng-south-west')
              };

              if (!map.googleMap.getBounds().equals(newBounds)) {
                skipMapIdleEventHandler = true;
                map.fitBoundaries(newBounds);
              }
            }
          }

          /**
           * Dynamic map handling aka "AirBnB mode".
           */
          if (
            typeof commonMapSettings.dynamic_map !== 'undefined'
            && commonMapSettings.dynamic_map.enable
          ) {

            /**
             * Update the view depending on dynamic map settings and capability.
             *
             * One of several states might occur now. Possible state depends on whether:
             * - view using AJAX is enabled
             * - map view is the containing (page) view or an attachment
             * - the exposed form is present and contains the boundary filter
             * - map settings are consistent
             *
             * Given these factors, map boundary changes can be handled in one of three ways:
             * - trigger the views AJAX "RefreshView" command
             * - trigger the exposed form causing a regular POST reload
             * - fully reload the website
             *
             * These possibilities are ordered by UX preference.
             *
             * @param {CommonMapUpdateSettings} dynamic_map_settings
             *   The dynamic map settings to update the map.
             */
            if (typeof map.updateDrupalView === 'undefined') {
              map.updateDrupalView = function (dynamic_map_settings) {
                // Make sure to load current form DOM element, which will change after every AJAX operation.
                var exposedForm = $('form#views-exposed-form-' + dynamic_map_settings.update_view_id.replace(/_/g, '-') + '-' + dynamic_map_settings.update_view_display_id.replace(/_/g, '-'));

                var currentBounds = map.googleMap.getBounds();
                var update_path = '';

                if (
                  typeof dynamic_map_settings.boundary_filter !== 'undefined'
                ) {
                  if (exposedForm.length) {
                    exposedForm.find('input[name="' + dynamic_map_settings.parameter_identifier + '[lat_north_east]"]').val(currentBounds.getNorthEast().lat());
                    exposedForm.find('input[name="' + dynamic_map_settings.parameter_identifier + '[lng_north_east]"]').val(currentBounds.getNorthEast().lng());
                    exposedForm.find('input[name="' + dynamic_map_settings.parameter_identifier + '[lat_south_west]"]').val(currentBounds.getSouthWest().lat());
                    exposedForm.find('input[name="' + dynamic_map_settings.parameter_identifier + '[lng_south_west]"]').val(currentBounds.getSouthWest().lng());

                    $('input[type=submit], input[type=image], button[type=submit]', exposedForm).not('[data-drupal-selector=edit-reset]').trigger('click');
                  }
                  // No AJAX, no form, just enforce a page reload with GET parameters set.
                  else {
                    if (window.location.search.length) {
                      update_path = window.location.search + '&';
                    }
                    else {
                      update_path = '?';
                    }
                    update_path += dynamic_map_settings.parameter_identifier + '[lat_north_east]=' + currentBounds.getNorthEast().lat();
                    update_path += '&' + dynamic_map_settings.parameter_identifier + '[lng_north_east]=' + currentBounds.getNorthEast().lng();
                    update_path += '&' + dynamic_map_settings.parameter_identifier + '[lat_south_west]=' + currentBounds.getSouthWest().lat();
                    update_path += '&' + dynamic_map_settings.parameter_identifier + '[lng_south_west]=' + currentBounds.getSouthWest().lng();

                    window.location = update_path;
                  }
                }
              };
            }

            if (map.wrapper.data('geolocationAjaxProcessed') !== 1) {
              var geolocationMapIdleTimer;
              map.googleMap.addListener('idle', function () {
                if (skipMapIdleEventHandler === true) {
                  skipMapIdleEventHandler = false;
                  return;
                }
                clearTimeout(geolocationMapIdleTimer);
                geolocationMapIdleTimer = setTimeout(function () {
                  map.updateDrupalView(commonMapSettings.dynamic_map);
                }, commonMapSettings.dynamic_map.views_refresh_delay);
              });
            }
          }

          map.addLoadedCallback(function (map) {
            $.each(map.mapMarkers, function (index, marker) {
              marker.addListener('click', function () {
                if (commonMapSettings.markerScrollToResult === true) {
                  var target = $('[data-location-id="' + location.data('location-id') + '"]:visible').first();

                  // Alternatively select by class.
                  if (target.length === 0) {
                    target = $('.geolocation-location-id-' + location.data('location-id') + ':visible').first();
                  }

                  if (target.length === 1) {
                    $('html, body').animate({
                      scrollTop: target.offset().top
                    }, 'slow');
                  }
                }
              });
            });
          });

          /**
           * Context popup handling.
           */
          if (
            typeof commonMapSettings.contextPopupContent !== 'undefined'
            && commonMapSettings.contextPopupContent.enable
          ) {

            /** @type {jQuery} */
            var contextContainer = jQuery('<div class="geolocation-context-popup"></div>');
            contextContainer.hide();
            contextContainer.appendTo(map.container);

            /**
             * Gets the default settings for the Google Map.
             *
             * @param {GoogleMapLatLng} latLng - Coordinates.
             * @return {GoogleMapPoint} - Pixel offset against top left corner of map container.
             */
            map.googleMap.fromLatLngToPixel = function (latLng) {
              var numTiles = 1 << map.googleMap.getZoom();
              var projection = map.googleMap.getProjection();
              var worldCoordinate = projection.fromLatLngToPoint(latLng);
              var pixelCoordinate = new google.maps.Point(
                worldCoordinate.x * numTiles,
                worldCoordinate.y * numTiles);

              var topLeft = new google.maps.LatLng(
                map.googleMap.getBounds().getNorthEast().lat(),
                map.googleMap.getBounds().getSouthWest().lng()
              );

              var topLeftWorldCoordinate = projection.fromLatLngToPoint(topLeft);
              var topLeftPixelCoordinate = new google.maps.Point(
                topLeftWorldCoordinate.x * numTiles,
                topLeftWorldCoordinate.y * numTiles);

              return new google.maps.Point(
                pixelCoordinate.x - topLeftPixelCoordinate.x,
                pixelCoordinate.y - topLeftPixelCoordinate.y
              );
            };

            google.maps.event.addListener(map.googleMap, 'rightclick', function (event) {
              var content = Drupal.formatString(commonMapSettings.contextPopupContent.content, {
                '@lat': event.latLng.lat(),
                '@lng': event.latLng.lng()
              });

              contextContainer.html(content);

              if (content.length > 0) {
                var pos = map.googleMap.fromLatLngToPixel(event.latLng);
                contextContainer.show();
                contextContainer.css('left', pos.x);
                contextContainer.css('top', pos.y);
              }
            });

            google.maps.event.addListener(map.googleMap, 'click', function (event) {
              if (typeof contextContainer !== 'undefined') {
                contextContainer.hide();
              }
            });
          }

          /**
           * MarkerClusterer handling.
           */
          if (
            typeof commonMapSettings.markerClusterer !== 'undefined'
            && commonMapSettings.markerClusterer.enable
            && typeof MarkerClusterer !== 'undefined'
          ) {

            /* global MarkerClusterer */

            var imagePath = '';
            if (commonMapSettings.markerClusterer.imagePath) {
              imagePath = commonMapSettings.markerClusterer.imagePath;
            }
            else {
              imagePath = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';
            }

            var markerClustererStyles = '';
            if (typeof commonMapSettings.markerClusterer.styles !== 'undefined') {
              markerClustererStyles = commonMapSettings.markerClusterer.styles;
            }

            new MarkerClusterer(
              map.googleMap,
              map.mapMarkers,
              {
                imagePath: imagePath,
                styles: markerClustererStyles
              }
            );
          }
        }
      );

    }
  };

  /**
   * Insert updated map contents into the document.
   *
   * ATTENTION: This is a straight ripoff from misc/ajax.js ~line 1017 insert() function.
   * Please read all code commentary there first!
   *
   * @param {Drupal.Ajax} ajax
   *   {@link Drupal.Ajax} object created by {@link Drupal.ajax}.
   * @param {object} response
   *   The response from the Ajax request.
   * @param {string} response.data
   *   The data to use with the jQuery method.
   * @param {string} [response.method]
   *   The jQuery DOM manipulation method to be used.
   * @param {string} [response.selector]
   *   A optional jQuery selector string.
   * @param {object} [response.settings]
   *   An optional array of settings that will be used.
   * @param {number} [status]
   *   The XMLHttpRequest status.
   */
  Drupal.AjaxCommands.prototype.geolocationCommonMapsUpdate = function (ajax, response, status) {
    // See function comment for code origin first before any changes!
    var $wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
    var settings = response.settings || ajax.settings || drupalSettings;

    var $new_content_wrapped = $('<div></div>').html(response.data);
    var $new_content = $new_content_wrapped.contents();

    if ($new_content.length !== 1 || $new_content.get(0).nodeType !== 1) {
      $new_content = $new_content.parent();
    }

    Drupal.detachBehaviors($wrapper.get(0), settings);

    // Retain existing map if possible, to avoid jumping and improve UX.
    if (
      $new_content.find('.geolocation-common-map-container').length > 0
      && $wrapper.find('.geolocation-common-map-container').length > 0
    ) {
      var detachedMap = $wrapper.find('.geolocation-common-map-container').first().detach();
      $new_content.find('.geolocation-common-map-container').first().replaceWith(detachedMap);
      $new_content.find('.geolocation-common-map').data('geolocation-ajax-processed', 1);
    }

    $wrapper.replaceWith($new_content);

    // Attach all JavaScript behaviors to the new content, if it was
    // successfully added to the page, this if statement allows
    // `#ajax['wrapper']` to be optional.
    if ($new_content.parents('html').length > 0) {
      // Apply any settings from the returned JSON if available.
      Drupal.attachBehaviors($new_content.get(0), settings);
    }
  };

})(jQuery, window, Drupal, drupalSettings);
