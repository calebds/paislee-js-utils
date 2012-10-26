/**
 * Paislee's JavaScript Utils
 */
var pjs_utils = function(w, d) {
  
  /**
   * Get jQuery if needed
   */
  if (!w.jQuery) {
    var script = d.createElement("script");
    script.type = "text/javascript";
    script.src = "http://code.jquery.com/jquery-latest.min.js";
    d.getElementsByTagName("head")[0].appendChild(script);
  }
  
  /**
   * Object.create polyfill
   */
  if (!Object.create) {
    w.Object.create = function (o) {
      function F() {}
      F.prototype = o;
      return new F();
    };
  };
  
  return {
    /**
     * Wraps jQuery's AJAX, adds X-Domain support for IE
     * 
     *
     */
    xDomainAJAX : function(url, settings) {
      $.support.cors = true; // enable x-domain
      if ($.browser.msie && parseInt($.browser.version, 10) >= 8 && XDomainRequest) {
        // use ms xdr
        var xdr = new XDomainRequest();
        xdr.open(settings.type, url + '?' + $.param(settings.data));
        xdr.onprogress = function() {};
        xdr.onload = function() {
          settings.success(xdr.responseText);
        };
        xdr.onerror = settings.error;
        xdr.send();
      } else {
        // use jQuery ajax
        $.ajax(url, settings);
      }
    },
  
    /**
     * Gets the value of the provided query arg from a URL string
     * 
     * @param {String} name The name of the query arg to retrieve
     * @param {String} [url] Optional url string, defaults to window.location
     * 
     * @return The value of the query arg or null if not found
     */          
    getURLParameter : function(name, url) {
      url = url || location;
      return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(url.search)||[,null])[1]);
    }
  }
  
}(window, document);
