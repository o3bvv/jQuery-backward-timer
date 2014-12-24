(function($) {

    $.backward_timer = function(element) {
        var defaults = {
            seconds: 5
            , format: "h%:m%:s%"
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
                plugin.methods.reset()
            }
            , start: function() {
                if (plugin.timeout == undefined) {
                    var delay = (plugin.seconds_left == plugin.settings.seconds)
                        ? 0
                        : 1000
                    setTimeout(plugin.methods._on_tick, delay, delay)
                }
            }
            , cancel: function() {
                if (plugin.timeout != undefined) {
                    clearTimeout(plugin.timeout)
                    plugin.timeout = undefined
                }
            }
            , reset: function() {
                plugin.seconds_left = plugin.settings.seconds
                plugin.methods._render_seconds()
            }
            , _on_tick: function(prev_delay) {
                if (prev_delay != 0) {
                    plugin.settings.on_tick(plugin)
                }
                plugin.methods._render_seconds()
                if (plugin.seconds_left > 0) {
                    plugin.seconds_left--
                    var delay = 1000
                    plugin.timeout = setTimeout(plugin.methods._on_tick, delay, delay)
                } else {
                    plugin.timeout = undefined
                    plugin.settings.on_exhausted(plugin)
                }
            }
            , _render_seconds: function() {
                var dhms = plugin.methods._seconds_to_dhms(plugin.seconds_left)
                , value = plugin.settings.format

                if (value.indexOf("d%") !== -1) {
                    value = value.replace(
                        'd%', dhms.d).replace(
                        'h%', plugin.methods._check_leading_zero(dhms.h))
                } else {
                    value = value.replace('h%', dhms.d*24+dhms.h)
                }
                value = value.replace(
                    'm%', plugin.methods._check_leading_zero(dhms.m)).replace(
                    's%', plugin.methods._check_leading_zero(dhms.s))
                plugin.target.text(value)
            }
            , _seconds_to_dhms: function(seconds) {
                var days = Math.floor(seconds / (24 * 3600))
                , seconds = seconds - (days * 24 * 3600)
                , hours = Math.floor(seconds / 3600)
                , seconds = seconds - (hours * 3600)
                , mins = Math.floor(seconds / 60)
                , secs = Math.floor(seconds - (mins * 60))

                return {d: days, h: hours, m: mins, s: secs}
            }
            , _check_leading_zero: function (number) {
                return (number < 10)
                    ? '0' + number
                    : ''  + number
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
                return plugin.methods[method_or_options].apply(
                    this, Array.prototype.slice.call(options, 1))
            } else if (typeof method_or_options === 'object' || !method_or_options) {
                return plugin.methods.init.apply(this, options)
            } else {
                $.error('Method ' + method_or_options + ' does not exist on jQuery.backward_timer')
            }
        })
    }

})(jQuery)