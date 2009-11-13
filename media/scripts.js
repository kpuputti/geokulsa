/*jslint white: true, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
/*global google:false, $:false, jQuery:false*/

// Simple logger to Firebug's console.
// Wrapped with try/catch to avoid errors in other browsers.
var LOG = function (msg) {
    try {
        console.log(msg);
    } catch (e) {}
};

// Namespace object for all Javascript code.
var GEO = {};

GEO.map = (function () {

    var map,
        lat,
        lng;

    return {
        init: function () {
            var latlng = new google.maps.LatLng(60.1847242, 24.8244935);
            map = new google.maps.Map(document.getElementById("map"), {
                'zoom': 14,
                'center': latlng,
                'mapTypeId': google.maps.MapTypeId.ROADMAP,
                'mapTypeControl': false
            });

        }
    };

}());

$(document).ready(function () {

    GEO.map.init();

});
