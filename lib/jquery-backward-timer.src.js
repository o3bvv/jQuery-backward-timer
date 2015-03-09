/**
 * @summary     jQuery.backward_timer
 * @description This plugin gives an ability to create controlled backward timers on web pages.
 * @version     1.1.4
 * @file        jquery-backward-timer.src.js
 * @author      oblalex
 * @contact     http://about.me/oblovatniy
 * @copyright   Copyright 2014-2015 Alexander Oblovatniy
 *
 * This source file is free software, available under the following license:
 *   MIT license - https://github.com/oblalex/jQuery-backward-timer/blob/gh-pages/LICENSE
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 */
(function($) {

    $.backward_timer = function(element) {
        var defaults = {
            seconds: 5
            , step: 1
            , stop_at_zero: true
            , format: "h%:m%:s%"
            , value_setter: undefined
            , on_start: function(timer) {}
            , on_cancel: function(timer) {}
            , on_exhausted : function(timer) {}
            , on_tick : function(timer) {}
        }
        , plugin = this

        plugin.seconds_left = 0
        plugin.target = $(element)
        plugin.timeout = undefined
        plugin.settings = {}

        plugin.methods = {
            init: function(options) {
                plugin.settings = $.extend({}, defaults, options)

                if (plugin.settings.value_setter == undefined) {
                  if (plugin.target.is('input')) {
                    plugin.settings.value_setter = 'val'
                  } else {
                    plugin.settings.value_setter = 'text'
                  }
                }

                plugin.methods.reset()
            }
            , start: function() {
                if (
                    plugin.timeout == undefined
                    && !plugin.methods._is_exhausted()
                ) {
                    plugin.settings.on_start(plugin)

                    var interval = (plugin.seconds_left == plugin.settings.seconds)
                                    ? 0
                                    : plugin.settings.step * 1000
                    setTimeout(plugin.methods._on_tick, interval, interval)
                }
            }
            , cancel: function() {
                if (plugin.timeout != undefined) {
                    clearTimeout(plugin.timeout)
                    plugin.timeout = undefined
                    plugin.settings.on_cancel(plugin)
                }
            }
            , reset: function() {
                plugin.seconds_left = plugin.settings.seconds
                plugin.methods._render_seconds()
            }
            , _on_tick: function(previous_delay) {
                if (previous_delay != 0) {
                    plugin.settings.on_tick(plugin)
                }

                plugin.methods._render_seconds()

                if (plugin.methods._is_exhausted()) {
                    plugin.timeout = undefined
                    plugin.settings.on_exhausted(plugin)
                } else {
                    if (
                        plugin.seconds_left < plugin.settings.step
                        && plugin.settings.stop_at_zero
                    ) {
                        var step = plugin.seconds_left
                    } else {
                        var step = plugin.settings.step
                    }

                    plugin.seconds_left -= step

                    var interval = step * 1000
                    plugin.timeout = setTimeout(plugin.methods._on_tick,
                                                interval,
                                                interval)
                }
            }
            , _render_seconds: function() {
                var dhms = plugin.methods._seconds_to_dhms(plugin.seconds_left)
                  , value = plugin.settings.format

                if (value.indexOf("d%") !== -1) {
                    value = value
                            .replace('d%', dhms.d)
                            .replace('h%', plugin.methods._check_leading_zero(dhms.h))
                } else {
                    value = value.replace('h%', dhms.d * 24 + dhms.h)
                }

                value = value
                        .replace('m%', plugin.methods._check_leading_zero(dhms.m))
                        .replace('s%', plugin.methods._check_leading_zero(dhms.s))

                if (plugin.seconds_left < 0) {
                    value = '-' + value
                }

                plugin.target[plugin.settings.value_setter](value)
            }
            , _seconds_to_dhms: function(seconds) {
                var seconds = Math.abs(seconds)
                , days = Math.floor(seconds / (24 * 3600))
                , seconds = seconds - (days * 24 * 3600)
                , hours = Math.floor(seconds / 3600)
                , seconds = seconds - (hours * 3600)
                , mins = Math.floor(seconds / 60)
                , seconds = Math.floor(seconds - (mins * 60))

                return {d: days, h: hours, m: mins, s: seconds}
            }
            , _check_leading_zero: function (number) {
                return (number < 10)
                        ? '0' + number
                        : ''  + number
            }
            , _is_exhausted: function() {
                return plugin.seconds_left <= 0 && plugin.settings.stop_at_zero
            }
        }
    }

    $.fn.backward_timer = function(method_or_options) {
        var options = arguments

        return this.each(function() {
            var plugin = $(this).data('backward_timer')

            if (plugin == undefined) {
                plugin = new $.backward_timer(this)
                $(this).data('backward_timer', plugin);
            }

            if (plugin.methods[method_or_options]) {
                return plugin.methods[method_or_options]
                      .apply(this, Array.prototype.slice.call(options, 1))
            } else if (
              typeof method_or_options === 'object'
              || !method_or_options
            ) {
                return plugin.methods.init.apply(this, options)
            } else {
                $.error(
                  'Method '
                  + method_or_options
                  + ' does not exist on jQuery.backward_timer'
                )
            }
        })
    }

})(jQuery)
