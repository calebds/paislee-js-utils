/**
 * Paislee's JavaScript Utils
 */
var pjs = function(w, d) {
  
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
  
  function undef(check) {
    return (typeof check === "undefined");
  }
  
  /**
   * Get jQuery if needed
   */
  function jQueryRequired() {
    if (!w.jQuery) {
      var script = d.createElement("script");
      script.type = "text/javascript";
      script.src = "http://code.jquery.com/jquery-latest.min.js";
      d.getElementsByTagName("head")[0].appendChild(script);
    }
  }
  
  /**
   * Merge the properties of two objects into a third
   */
  function mergeObjects (obj1, obj2) {
    var merged = {};
    for (var key in obj1) { merged[key] = obj1[key]; }
    for (var key in obj2) { merged[key] = obj2[key]; }
    return merged;
  }
  
  /**
   * Minimal AMD-like module loader
   */
  var define = function() {
        
    var loadQueue = [];
    
    function loadModule(id, init) {
      var names = id.split("."),
          parent = w,
          name;      
      while (name = names.shift()) {
        if (names.length) {//branch node
          parent[name] = parent[name] || {};
          parent = parent[name];
        } else {//leaf node
          var moduleObj = (typeof init == "function" ? init() : init);
          parent[name] = (undef(parent[name])
            ? (moduleObj || {})
            : mergeObjects(parent[name], moduleObj));
          parent[name]["__pjs__"] = 1;
        }
      }
      console.log("[pjs] loaded module: " + id);
    }
    
    function canLoadModule(id, deps) {
      
      var dep,
          names,
          name,
          parent;
          
      for (var i = 0; i < deps.length; i++) {
        parent = w;
        names = deps[i].split(".");
        while (name = names.shift()) {
          
          // found unloaded dependency
          if (undef(parent[name])) return 0;

          // created as a branch node, but not loaded yet
          if (!names.length && !parent[name]["__pjs__"]) return 0;

          parent = parent[name];
        }        
      }
      
      return 1;// all dependencies loaded
    }
    
    function checkIfRequires(id, deps) {
      for (var i = 0; i < deps.length; i++) {
        if (id === deps[i]) return 1;
      }
      return 0;
    }
    
    return (function (id, deps, init) {

      if (undef(init)) {// no dependencies
        init = deps;
        deps = [];
      }
      
      if (canLoadModule(id, deps)) {
        
        var tempLoadQueue = [],
          currModule;
          
        loadModule(id, init);// load the module
                
        // try to load queued modules
        while (currModule = loadQueue.shift()) {
          if (canLoadModule(currModule.id, currModule.deps)) {
            loadModule(currModule.id, currModule.init);
          } else {
            tempLoadQueue.push(currModule);
          }
        }
        loadQueue = tempLoadQueue;
        
      } else {// queue the module for load
                
        var i;
        
        // a module's dependency is always before it in the queue        
        for (i = 0; i < loadQueue.length; i++) {
          if (checkIfRequires(id, loadQueue[i].deps)) break;
        }
        console.log(i);
        //console.log(i ? i-1 : 0);
        loadQueue.splice(i, 0, {
          id : id,
          deps : deps,
          init : init
        });
        console.log("loadQueue[");
        for (var i = 0; i < loadQueue.length; i++) {
          console.log("\t" + loadQueue[i].id + ", " + loadQueue[i].deps.join(","));
        }
        console.log("]");
        
      }
      
    });
    
  }();
    
  /**
   * Wraps jQuery's AJAX, adds X-Domain support for IE
   * 
   *
   */
  function xDomainAJAX (url, settings) {
    jQueryRequired();
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
  }
  
  /**
   * Gets the value of the provided query arg from a URL string
   * 
   * @param {String} name The name of the query arg to retrieve
   * @param {String} [url] Optional url string, defaults to window.location
   * 
   * @return The value of the query arg or null if not found
   */          
  function getURLParameter(name, url) {
      url = url || location;
      return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(url.search)||[,null])[1]);
  }
  
  // API
  return {
    jQueryRequired : jQueryRequired,
    define : define,
    xDomainAJAX : xDomainAJAX,
    getURLParameter : getURLParameter,
    undef : undef
  }  
  
}(window, document);
