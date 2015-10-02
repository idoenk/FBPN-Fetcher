// ==UserScript==
// @name           Facebook-Page-Named Fetcher
// @icon           https://www.gstatic.com/images/icons/material/product/2x/developers_32dp.png
// @version        0.1
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM_log
// @namespace      http://127.0.0.1/scripts/show/Facebook-Page-Named-Fetcher
// @dtversion      1510021530
// @timestamp      1443774692386
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @description    provide a quick reply feature, under circumstances capcay required.
// @include        http://*.facebook.com/search/str/*/pages-named
// @include        https://*.facebook.com/search/str/*/pages-named
// @author         Idx
// @license        (CC) by-nc-sa 3.0
//
// ==/UserScript==
//
// v0.1 - 2015-10-02 . 1443774692386
//   Init
// --
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0 License
// http://creativecommons.org/licenses/by-nc-sa/3.0/deed.ms
// --------------------------------------------------------
// (function(){


// Initialize Global Variables
var gvar = function(){};

gvar.sversion = 'v' + '0.1';
gvar.scriptMeta = {};
gvar.settings_done = null;
gvar.auto_next_halted = null;
/*
window.alert(new Date().getTime());
*/

// development-stage
gvar.__DEBUG__ = 1;
gvar.$w = window;
gvar.auto_next_page = false;

var KS = 'KEY_SAVE_',
  GMSTORAGE_PATH  = 'GM_',
  OPTIONS_BOX = {
    KEY_SAVE_BULKPAGES: [''], // bulkpages
    KEY_SAVE_INDEXPAGE: ['']  // index page
  }
;

// eof-glob-variables
//=================//


var GM_addGlobalStyle = function (a, b, c) {
  var d, e;
  if (a.match(/^https?:\/\/.+/)) {
    d = createEl("link", { type: "text/css", rel:'stylesheet', href:a });
  }else{
    d = createEl("style", { type: "text/css" });
    d.appendChild(createTextEl(a));
  }
  if (isDefined(b) && isString(b)) d.setAttribute("id", b);
  if (isDefined(c) && c) {
    document.body.insertBefore(d, document.body.firstChild)
  } else {
    e = document.getElementsByTagName("head");
    if (isDefined(e[0]) && e[0].nodeName == "HEAD") gvar.$w.setTimeout(function () {
      e[0].appendChild(d)
    }, 100);
    else document.body.insertBefore(d, document.body.firstChild)
  }
  return d
};
// Native Get Elements
var $D=function (q, root, single) {
  if (root && typeof root == 'string') {
    root = $D(root, null, true);
    if (!root) { return null; }
  }
  if( !q )
    return false;
  if ( typeof q == 'object')
    return q;
  root = root || document;
  if (q[0]=='/' || (q[0]=='.' && q[1]=='/')) {
    if (single) {
      return document.evaluate(q, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    return document.evaluate(q, root, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  } else if (q[0]=='.') {
    return root.getElementsByClassName(q.substr(1));
  } else {
    return root.getElementById( q[0]=='#' ? q.substr(1) : q.substr(0) );
  }
};

//=== mini-functions
// static routine
function isDefined(x)   { return !(x == null && x !== null); }
function isUndefined(x) { return x == null && x !== null; }
function isString(x) { return (typeof(x)!='object' && typeof(x)!='function'); }
function trimStr(x) { return (typeof(x)=='string' && x ? x.replace(/^\s+|\s+$/g,"") : '') };
function isLink(x, strict) {
  var re = new RegExp( (strict ? '^':'') + '((?:http(?:s|)|ftp):\\/\\/)(?:\\w|\\W)+(?:\\.)(?:\\w|\\W)+', "");
  return x.match(re);
}

function createTextEl(a) {
  return document.createTextNode(a)
}
function createEl(a, b, c) {
  var d = document.createElement(a);
  for (var e in b) if (b.hasOwnProperty(e)) d.setAttribute(e, b[e]);
  if (c) d.innerHTML = c;
  return d
}
function getValue(key, cb) {
  var ret, data=OPTIONS_BOX[key];
  if( !data ) return;
  setTimeout(function(){
    ret = GM_getValue(key,data[0]);
    if(typeof(cb)=='function')
      cb(ret);
    else if(cb)
      cb = ret;
    else
      return ret;
  }, 0);
}
function setValue(key, value, cb) {
  var ret, data=OPTIONS_BOX[key];
  if( !data ) return;
  setTimeout(function(){
    try{
      ret = GM_setValue(key,value)
      if(typeof(cb)=='function')
        cb(ret);
      else if(cb)
        cb = ret;
      else
        return ret;
    }catch(e){ clog(e.message) }
  }, 0);
}
function delValue(key, cb){
  try{
    setTimeout(function() {
      ret = GM_deleteValue( key );
      if( typeof(cb)=='function' )
        cb(ret);
    }, 0);
  }catch(e){}
}
function setValueForId(userID, value, gmkey, sp){
  if( !userID ) return null;
  
  sp = [(isDefined(sp) && typeof(sp[0])=='string' ? sp[0] : ';'), (isDefined(sp) && typeof(sp[1])=='string' ? sp[1] : '::')];
  var i, ksg = KS+gmkey, info;
  getValue(ksg, function(val){
    info = val;
    if( !info ){
      setValue(ksg, userID+"="+value);
      return;
    }
    info = info.split( sp[0] );
    for(i=0; i<info.length; i++){
      if(info[i].split('=')[0]==userID){
        info.splice(i,1,userID+"="+value);
        setValue(ksg, info.join(sp[0]));
        return;
      }
    }
    
    info.splice(i, 0, userID+"="+value);
    setValue(ksg, info.join(sp[0]));
  });
}


// ----my ge-debug--------
function show_alert(msg, force) {
  console.log(msg);
}
function clog(msg) {
  if( !gvar.__DEBUG__ ) return;
  var isPlain = (["string", "number"].indexOf(typeof msg) !== -1);
  var msgStr = (isPlain ? '[FBP:dbg] '+msg : msg);
  if( !isPlain )
    show_alert('[FBP:dbg] '+typeof msg);

  show_alert(msgStr);
}

// start
clog("First Start.");
var target_wrapper = "#contentArea";
var target_id = null;
var BULKDATA = [];
var INDEXDATA = {};


function design_page(){
  gvar.search_term = '';
  var $form = $('form[action*="direct_search.php"]');
  if( $form.length ){
    
    gvar.search_term = $form.find('input[name="q"]').val();
  }
  clog("search-term="+gvar.search_term);

  var CSS = ''
    +'.fbpn-wrapper{position:fixed; background-color: #fff; padding:2px 5px; opacity: .88; z-index:99999; top:45px; left:1px; width: auto;}'
    +'.fbpn-hide{display:none;}'
    +'.btn{ vertical-align: middle;background-color: #f6f7f8; color: #fff; border-radius: 2px; box-shadow: 0 1px 1px rgba(0, 0, 0, .05); margin:0 2px; height: 22px;}'
    +'textarea.fbpn-jsondata{width:200px; max-width:200px; min-width:200px; min-height:200px; font-family: monospace,Courier,Arial!important; font-size: 10px; line-height: 12px;}'
    +'.btn-danger{background-color: #CC0000; background-image: none; color: #fff;}'
    +'.nav-controls{margin-top: 10px;}'
    +'.btn > ._50__{display:inline-block;}'
    +'.lb-auto{line-height: 20px; display: block; vertical-align: top;}'
  ;
  var pagehtml = ''
    +'<div class="fbpn-wrapper">'
    +'<h4>FBPN-Fetcher</h4>'
    +'<div class="fb-page-named-container">'
    +'<p>Items Count: <strong><code id="fbpn-counter">0</code></strong></p>'
    +'<hr/>'
    +'<label class="lb-auto"><input type="checkbox" id="fbpb-autonextpage" '+(gvar.auto_next_page ? ' checked="checked"':'')+'/> Auto Next Page</label>'
    +'<div class="nav-controls">'
    +'<button id="btn_clear_data" class="btn _4jy0 517h btn-danger" data-bt="{\"ct\":\"bulk_data\"}" type="button">CLEAR DATA</button>'
    +'<button id="btn_json_data" class="btn 517h uiButton uiButtonConfirm" data-bt="{\"ct\":\"bulk_data\"}" type="button">JSON-DATA&nbsp;<i class="_50__"></i></button>'
    +'<div id="fbpn-wrapresult" class="fbpn-hide"></div>'
    +'</div>' // nav-controls
    +'</div>' // fb-page-named-container
    +'</div>'
  ;
  GM_addGlobalStyle(CSS, 'fbpn_css', true);
  $("body").prepend( $(pagehtml) );
  clog("panel attached..");

  // attaching events
  events_page();
}

function events_page(){
  $("#fbpb-autonextpage").click(function(){
    var $me = $(this);
    gvar.auto_next_page = $me.is(":checked");

    if( gvar.auto_next_halted )
      scan_main_container( $("#"+target_wrapper) );
  });
  $("#btn_json_data").click(function(){
    var $target = $("#fbpn-wrapresult");
    if( !$target.is(":visible") ){
      getValue(KS + 'BULKPAGES', function(values){
        if( values ){
          $target.html(''
            +'<textarea readonly="readonly" class="fbpn-jsondata">'+values+'</textarea>'
          );
        }
        else{
          $target.html('<p>Bulk Data Not Found</p>');
        }
        $target.removeClass("fbpn-hide");
      });
    }
    else{
      $target.addClass("fbpn-hide");
    }
  });
  $("#btn_clear_data").click(function(){
    if( confirm("Are You Sure?") ){
      delValue(KS + 'BULKPAGES', function(){
        clog("BULKPAGES Deleted.");
        setTimeout(function() { location.reload(false); }, 500);
      });
    }
  });
}

function getSettings(cb){
  var keychecks = ['BULKPAGES', 'INDEXPAGE'];
  var allchecks = [];
  var wait_all_done = function(){
    if( allchecks.length < keychecks.length ){
      return setTimeout(function(){
        wait_all_done();
      }, 2000)
    }
    else{
      gvar.settings_done = true;
      clog("getSettings Complete.");
      if("function" == typeof cb)
        return cb();
    }
  };

  getValue(KS + 'BULKPAGES', function(values){
    clog("values from storage BULKPAGES="+values);
    if( values ){
      try{
        BULKDATA = JSON.parse(values);
      }catch(e){}
      if( !BULKDATA )
        BULKDATA = [];
    }
    allchecks.push(1);
  });

  getValue(KS + 'INDEXPAGE', function(values){
    clog("values from storage INDEXPAGE="+values);
    if( values ){
      try{
        INDEXDATA = JSON.parse(values);
      }catch(e){}
      if( !INDEXDATA )
        INDEXDATA = {};
    }
    allchecks.push(1);
  });
  return wait_all_done();
}

function scan_main_container($parent){
  clog("inside scan_main_container");
  clog("scan through under parent="+$parent.find(" > div").not(".passed").length);
  $parent.find(" > div").not(".passed").each(function(){
    var $me = $(this);
    clog("checking element id="+$me.attr("id"));
    if( $me.attr("id").indexOf("ScrollingPager") != -1 && !$me.html() ){
      clog("ScrollingPager container empty..");
      return true;
    }

    //https://www.facebook.com/pages/Jokowi-Dodo/1684832715074327?ref=br_rs
    var elements = $D('.//a[contains(@href, "ref=br_rs") and not(@tabindex) and not(@data-hovercard)]', $me.get(0));
    var $el, $parentbt, $parentmeta, $el_meta;

    clog("row elements under parent="+elements.snapshotLength);
    if( elements.snapshotLength ){
      for(var i=0; i<elements.snapshotLength; i++){
        $el = $( elements.snapshotItem(i) );
        clog( $el.text() );

        $parentbt = $el.closest("[data-bt]");
        
        var cucok, countlike, rdata={}, databt = $parentbt.attr("data-bt");
        if( databt ){
          try{
            databt = JSON.parse( databt );
          }catch(e){}

          if( !(databt && databt.id) )
            continue;

          if( "undefined" != typeof INDEXDATA[databt.id] ){
            // should be find the element to update the likes count
            clog("hit stored data, updating..");
            // continue;

            // reduce big-array of this element to update
            BULKDATA = $.grep(BULKDATA, function(e){
              return e.id != databt.id;
            });
          }

          rdata ={
            id: databt.id,
            name: $el.text(),
            url: $el.attr("href"),
            type: '',
            likes: 0
          };

          $parentmeta = $el.closest(".clearfix").parent();
          
          // find page-type 
          $el_meta = $D('.//div[contains(@data-bt, "sub_headers")]', $parentmeta.get(0), true);
          if( $el_meta ){
            $el_meta = $( $el_meta );
            rdata["type"] = $el_meta.text();
          }

          $el_meta = $D('.//*[contains(@href,"/likers")]', $parentmeta.get(0), true);
          if( $el_meta ){
            $el_meta = $( $el_meta );
            countlike = $el_meta.text();
            countlike = trimStr(countlike.replace(/\,/g,''));
            if( cucok = /^(\d+)/.exec(countlike) )
              countlike = parseFloat(cucok[1]);

            if( countlike )
              rdata["likes"] = countlike;
          }

          BULKDATA.push( rdata );
          INDEXDATA[databt.id] = 1;
        }
      }
      // end-for
    }
    else{
      clog("empty container.")
    }

    $me.addClass("passed");
  });

  clog(BULKDATA);
  clog(INDEXDATA);
  clog("Item-Count="+BULKDATA.length);

  
  // saving current fetched
  clog("saving current BULKDATA");
  if( BULKDATA )
    setValue(KS+'BULKPAGES', JSON.stringify(BULKDATA));

  if( INDEXDATA )
    setValue(KS+'INDEXPAGE', JSON.stringify(INDEXDATA));


  // update counter
  $("#fbpn-counter").text( BULKDATA.length );

  if( gvar.auto_next_page ){
    gvar.auto_next_halted = false;
    clog("Wait a second to load next page..");
    setTimeout(function(){
      clog("scrolling....");
      $("html, body").animate({
        scrollTop: $(document).height()
      }, "fast");
    }, 1000);
  }
  else{
    gvar.auto_next_halted = true;
  }
}

function event_watch_very_parent(ev){
  clog("inside event_watch_very_parent");
  if( null === gvar.settings_done ){
    clog("settings not loaded yet, exiting.");
    return true;
  }

  if( ev.type == 'DOMNodeInserted' )
    scan_main_container( $("#"+target_wrapper) );
}

// get id of that very parent wrapper
function event_watch_content_area(ev){
  clog("inside event_watch_content_area");
  var $el = $(ev.target||ev);
  clog("target_id="+target_id);

  if( ev.type == 'DOMNodeInserted' ){
    clog("DOMNodeInserted detected..");
    if( !target_id ){
      target_id = $el.attr("id");

      if( target_id )
        $(target_wrapper).unbind("DOMNodeInserted", event_watch_content_area);

      // set new wrapper
      target_wrapper = $("#"+target_id+" > div").attr("id");
      clog("[NEW] target_wrapper="+target_wrapper);

      var $newparent = $("#"+target_wrapper);
      var delay = 4; // in seconds
      $newparent.bind("DOMNodeInserted", event_watch_very_parent);

      clog("Waiting "+delay+' seconds...');
      setTimeout(function(){
        getSettings(function(){
          scan_main_container( $newparent )
        });
      }, delay * 1000);
    }
  }
}



setTimeout(function(){ design_page() }, 4000);
$(target_wrapper).bind("DOMNodeInserted", event_watch_content_area);
// ============
// ~Idx.
