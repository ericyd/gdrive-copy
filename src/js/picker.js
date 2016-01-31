var $ = jQuery = require('jquery');

var selectedFolder = {};
var pickerApiLoaded = false;
var pickerBuilder;

exports.getSelectedFolder = function() {
    return selectedFolder;
}

exports.onApiLoad = function() {
    gapi.load('picker', {
        'callback': function() {
            pickerApiLoaded = true;
        }
    });
    google.script.run.withSuccessHandler(createPicker)
        .withFailureHandler(showError).getOAuthToken();
}

function createPicker(token) {

    if (pickerApiLoaded && token) {
        var foldersView = new google.picker.DocsView()
            .setIncludeFolders(true)
            .setMimeTypes('application/vnd.google-apps.folder')
            .setSelectFolderEnabled(true);

        pickerBuilder = new google.picker.PickerBuilder()
            .addView(foldersView)
            .hideTitleBar()
            .setOAuthToken(token)
            .setMaxItems(1)
            .setCallback(pickerCallback)
            .setTitle("Select a folder to copy")
            .setOrigin('https://script.google.com')
            .build();

    } else {
        // todo: handle errors
        
    }
}


exports.showPicker = function() {
    return pickerBuilder.setVisible(true);
}

/**
    * A callback function that extracts the chosen document's metadata from the
    * response object. For details on the response object, see
    * https://developers.google.com/picker/docs/result
    *
    * @param {object} data The response object.
    */
    
function pickerCallback(data) {
    var action = data[google.picker.Response.ACTION];
    
    if (action == google.picker.Action.PICKED) {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        selectedFolder.id = doc[google.picker.Document.ID];
        selectedFolder.parentId = doc[google.picker.Document.PARENT_ID];
        selectedFolder.name = doc[google.picker.Document.NAME];
        selectedFolder.newName = "Copy of " + selectedFolder.name;
        $("#newFolder").val(selectedFolder.newName);
        $("#folderName").text(selectedFolder.name);
        
    } else if (action == google.picker.Action.CANCEL) {
        google.script.host.close();
    }
}


function showError() {
    // an error occurred with loading the oauth token
}

var gapi=window.gapi=window.gapi||{};gapi._bs=new Date().getTime();(function(){var f=window,h=document,m=f.location,n=function(){},u=/\[native code\]/,w=function(a,b,c){return a[b]=a[b]||c},A=function(a){for(var b=0;b<this.length;b++)if(this[b]===a)return b;return-1},B=function(a){a=a.sort();for(var b=[],c=void 0,d=0;d<a.length;d++){var e=a[d];e!=c&&b.push(e);c=e}return b},C=function(){var a;if((a=Object.create)&&u.test(a))a=a(null);else{a={};for(var b in a)a[b]=void 0}return a},D=w(f,"gapi",{});var E;E=w(f,"___jsl",C());w(E,"I",0);w(E,"hel",10);var F=function(){var a=m.href,b;if(E.dpo)b=E.h;else{b=E.h;var c=RegExp("([#].*&|[#])jsh=([^&#]*)","g"),d=RegExp("([?#].*&|[?#])jsh=([^&#]*)","g");if(a=a&&(c.exec(a)||d.exec(a)))try{b=decodeURIComponent(a[2])}catch(e){}}return b},G=function(a){var b=w(E,"PQ",[]);E.PQ=[];var c=b.length;if(0===c)a();else for(var d=0,e=function(){++d===c&&a()},g=0;g<c;g++)b[g](e)},H=function(a){return w(w(E,"H",C()),a,C())};var J=w(E,"perf",C()),K=w(J,"g",C()),aa=w(J,"i",C());w(J,"r",[]);C();C();var L=function(a,b,c){var d=J.r;"function"===typeof d?d(a,b,c):d.push([a,b,c])},N=function(a,b,c){b&&0<b.length&&(b=M(b),c&&0<c.length&&(b+="___"+M(c)),28<b.length&&(b=b.substr(0,28)+(b.length-28)),c=b,b=w(aa,"_p",C()),w(b,c,C())[a]=(new Date).getTime(),L(a,"_p",c))},M=function(a){return a.join("__").replace(/\./g,"_").replace(/\-/g,"_").replace(/\,/g,"_")};var O=C(),P=[],Q=function(a){throw Error("Bad hint"+(a?": "+a:""));};P.push(["jsl",function(a){for(var b in a)if(Object.prototype.hasOwnProperty.call(a,b)){var c=a[b];"object"==typeof c?E[b]=w(E,b,[]).concat(c):w(E,b,c)}if(b=a.u)a=w(E,"us",[]),a.push(b),(b=/^https:(.*)$/.exec(b))&&a.push("http:"+b[1])}]);var ba=/^(\/[a-zA-Z0-9_\-]+)+$/,ca=/^[a-zA-Z0-9\-_\.,!]+$/,da=/^gapi\.loaded_[0-9]+$/,ea=/^[a-zA-Z0-9,._-]+$/,ia=function(a,b,c,d){var e=a.split(";"),g=e.shift(),l=O[g],k=null;l?k=l(e,b,c,d):Q("no hint processor for: "+g);k||Q("failed to generate load url");b=k;c=b.match(fa);(d=b.match(ga))&&1===d.length&&ha.test(b)&&c&&1===c.length||Q("failed sanity: "+a);return k},ka=function(a,b,c,d){a=ja(a);da.test(c)||Q("invalid_callback");b=R(b);d=d&&d.length?R(d):null;var e=function(a){return encodeURIComponent(a).replace(/%2C/g,
",")};return[encodeURIComponent(a.g).replace(/%2C/g,",").replace(/%2F/g,"/"),"/k=",e(a.version),"/m=",e(b),d?"/exm="+e(d):"","/rt=j/sv=1/d=1/ed=1",a.a?"/am="+e(a.a):"",a.c?"/rs="+e(a.c):"",a.f?"/t="+e(a.f):"","/cb=",e(c)].join("")},ja=function(a){"/"!==a.charAt(0)&&Q("relative path");for(var b=a.substring(1).split("/"),c=[];b.length;){a=b.shift();if(!a.length||0==a.indexOf("."))Q("empty/relative directory");else if(0<a.indexOf("=")){b.unshift(a);break}c.push(a)}a={};for(var d=0,e=b.length;d<e;++d){var g=
b[d].split("="),l=decodeURIComponent(g[0]),k=decodeURIComponent(g[1]);2==g.length&&l&&k&&(a[l]=a[l]||k)}b="/"+c.join("/");ba.test(b)||Q("invalid_prefix");c=S(a,"k",!0);d=S(a,"am");e=S(a,"rs");a=S(a,"t");return{g:b,version:c,a:d,c:e,f:a}},R=function(a){for(var b=[],c=0,d=a.length;c<d;++c){var e=a[c].replace(/\./g,"_").replace(/-/g,"_");ea.test(e)&&b.push(e)}return b.join(",")},S=function(a,b,c){a=a[b];!a&&c&&Q("missing: "+b);if(a){if(ca.test(a))return a;Q("invalid: "+b)}return null},ha=/^https?:\/\/[a-z0-9_.-]+\.google\.com(:\d+)?\/[a-zA-Z0-9_.,!=\-\/]+$/,
ga=/\/cb=/g,fa=/\/\//g,la=function(){var a=F();if(!a)throw Error("Bad hint");return a};O.m=function(a,b,c,d){(a=a[0])||Q("missing_hint");return"https://apis.google.com"+ka(a,b,c,d)};var U=decodeURI("%73cript"),V=function(a,b){for(var c=[],d=0;d<a.length;++d){var e=a[d];e&&0>A.call(b,e)&&c.push(e)}return c},ma=function(a){"loading"!=h.readyState?W(a):h.write("<"+U+' src="'+encodeURI(a)+'"></'+U+">")},W=function(a){var b=h.createElement(U);b.setAttribute("src",a);b.async="true";(a=h.getElementsByTagName(U)[0])?a.parentNode.insertBefore(b,a):(h.head||h.body||h.documentElement).appendChild(b)},na=function(a,b){var c=b&&b._c;if(c)for(var d=0;d<P.length;d++){var e=P[d][0],g=P[d][1];
g&&Object.prototype.hasOwnProperty.call(c,e)&&g(c[e],a,b)}},oa=function(a,b,c){X(function(){var c;c=b===F()?w(D,"_",C()):C();c=w(H(b),"_",c);a(c)},c)},Z=function(a,b){var c=b||{};"function"==typeof b&&(c={},c.callback=b);na(a,c);var d=a?a.split(":"):[],e=c.h||la(),g=w(E,"ah",C());if(g["::"]&&d.length){for(var l=[],k=null;k=d.shift();){var q=k.split("."),q=g[k]||g[q[1]&&"ns:"+q[0]||""]||e,x=l.length&&l[l.length-1]||null,y=x;x&&x.hint==q||(y={hint:q,b:[]},l.push(y));y.b.push(k)}var z=l.length;if(1<
z){var v=c.callback;v&&(c.callback=function(){0==--z&&v()})}for(;d=l.shift();)Y(d.b,c,d.hint)}else Y(d||[],c,e)},Y=function(a,b,c){a=B(a)||[];var d=b.callback,e=b.config,g=b.timeout,l=b.ontimeout,k=b.onerror,q=void 0;"function"==typeof k&&(q=k);var x=null,y=!1;if(g&&!l||!g&&l)throw"Timeout requires both the timeout parameter and ontimeout parameter to be set";var k=w(H(c),"r",[]).sort(),z=w(H(c),"L",[]).sort(),v=[].concat(k),T=function(a,b){if(y)return 0;f.clearTimeout(x);z.push.apply(z,p);var d=
((D||{}).config||{}).update;d?d(e):e&&w(E,"cu",[]).push(e);if(b){N("me0",a,v);try{oa(b,c,q)}finally{N("me1",a,v)}}return 1};0<g&&(x=f.setTimeout(function(){y=!0;l()},g));var p=V(a,z);if(p.length){var p=V(a,k),r=w(E,"CP",[]),t=r.length;r[t]=function(a){if(!a)return 0;N("ml1",p,v);var b=function(b){r[t]=null;T(p,a)&&G(function(){d&&d();b()})},c=function(){var a=r[t+1];a&&a()};0<t&&r[t-1]?r[t]=function(){b(c)}:b(c)};if(p.length){var I="loaded_"+E.I++;D[I]=function(a){r[t](a);D[I]=null};a=ia(c,p,"gapi."+
I,k);k.push.apply(k,p);N("ml0",p,v);b.sync||f.___gapisync?ma(a):W(a)}else r[t](n)}else T(p)&&d&&d()};var X=function(a,b){if(E.hee&&0<E.hel)try{return a()}catch(c){b&&b(c),E.hel--,Z("debug_error",function(){try{window.___jsl.hefn(c)}catch(a){throw c;}})}else try{return a()}catch(c){throw b&&b(c),c;}};D.load=function(a,b){return X(function(){return Z(a,b)})};K.bs0=window.gapi._bs||(new Date).getTime();L("bs0");K.bs1=(new Date).getTime();L("bs1");delete window.gapi._bs;})();
gapi.load("",{callback:window["gapi_onload"],_c:{"jsl":{"ci":{"deviceType":"desktop","oauth-flow":{"authUrl":"https://accounts.google.com/o/oauth2/auth","proxyUrl":"https://accounts.google.com/o/oauth2/postmessageRelay","disableOpt":true,"idpIframeUrl":"https://accounts.google.com/o/oauth2/iframe","usegapi":false},"debug":{"reportExceptionRate":0.05,"forceIm":false,"rethrowException":false,"host":"https://apis.google.com"},"lexps":[81,97,99,122,123,45,30,79,127],"enableMultilogin":true,"googleapis.config":{"auth":{"useFirstPartyAuthV2":false}},"isPlusUser":false,"inline":{"css":1},"disableRealtimeCallback":false,"drive_share":{"skipInitCommand":true},"csi":{"rate":0.01},"report":{"apiRate":{"gapi\\.signin\\..*":0.05,"gapi\\.signin2\\..*":0.05},"apis":["iframes\\..*","gadgets\\..*","gapi\\.appcirclepicker\\..*","gapi\\.auth\\..*","gapi\\.client\\..*"],"rate":0.001,"host":"https://apis.google.com"},"client":{"headers":{"request":["Accept","Accept-Language","Authorization","Cache-Control","Content-Disposition","Content-Encoding","Content-Language","Content-Length","Content-MD5","Content-Range","Content-Type","Date","GData-Version","Host","If-Match","If-Modified-Since","If-None-Match","If-Unmodified-Since","Origin","OriginToken","Pragma","Range","Slug","Transfer-Encoding","Want-Digest","X-ClientDetails","X-GData-Client","X-GData-Key","X-Goog-AuthUser","X-Goog-PageId","X-Goog-Encode-Response-If-Executable","X-Goog-Correlation-Id","X-Goog-Request-Info","X-Goog-Experiments","x-goog-iam-authority-selector","x-goog-iam-authorization-token","X-Goog-Spatula","X-Goog-Upload-Command","X-Goog-Upload-Content-Disposition","X-Goog-Upload-Content-Length","X-Goog-Upload-Content-Type","X-Goog-Upload-File-Name","X-Goog-Upload-Offset","X-Goog-Upload-Protocol","X-Goog-Visitor-Id","X-HTTP-Method-Override","X-JavaScript-User-Agent","X-Pan-Versionid","X-Origin","X-Referer","X-Upload-Content-Length","X-Upload-Content-Type","X-Use-HTTP-Status-Code-Override","X-YouTube-VVT","X-YouTube-Page-CL","X-YouTube-Page-Timestamp"],"response":["Digest","Cache-Control","Content-Disposition","Content-Encoding","Content-Language","Content-Length","Content-MD5","Content-Range","Content-Type","Date","ETag","Expires","Last-Modified","Location","Pragma","Range","Server","Transfer-Encoding","WWW-Authenticate","Vary","Unzipped-Content-MD5","X-Goog-Generation","X-Goog-Metageneration","X-Goog-Safety-Content-Type","X-Goog-Safety-Encoding","X-Google-Trace","X-Goog-Upload-Chunk-Granularity","X-Goog-Upload-Control-URL","X-Goog-Upload-Size-Received","X-Goog-Upload-Status","X-Goog-Upload-URL","X-Goog-Diff-Download-Range","X-Goog-Hash","X-Goog-Updated-Authorization","X-Server-Object-Version","X-Guploader-Customer","X-Guploader-Upload-Result","X-Guploader-Uploadid"]},"rms":"migrated","cors":false},"isLoggedIn":false,"signInDeprecation":{"rate":0.0},"include_granted_scopes":true,"llang":"en","plus_layer":{"isEnabled":false},"iframes":{"youtube":{"params":{"location":["search","hash"]},"url":":socialhost:/:session_prefix:_/widget/render/youtube?usegapi\u003d1","methods":["scroll","openwindow"]},"ytsubscribe":{"url":"https://www.youtube.com/subscribe_embed?usegapi\u003d1"},"plus_circle":{"params":{"url":""},"url":":socialhost:/:session_prefix::se:_/widget/plus/circle?usegapi\u003d1"},"plus_share":{"params":{"url":""},"url":":socialhost:/:session_prefix::se:_/+1/sharebutton?plusShare\u003dtrue\u0026usegapi\u003d1"},"rbr_s":{"params":{"url":""},"url":":socialhost:/:session_prefix::se:_/widget/render/recobarsimplescroller"},"udc_webconsentflow":{"params":{"url":""},"url":"https://www.google.com/settings/webconsent?usegapi\u003d1"},":source:":"3p","blogger":{"params":{"location":["search","hash"]},"url":":socialhost:/:session_prefix:_/widget/render/blogger?usegapi\u003d1","methods":["scroll","openwindow"]},"evwidget":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/events/widget?usegapi\u003d1"},":socialhost:":"https://apis.google.com","shortlists":{"url":""},"hangout":{"url":"https://talkgadget.google.com/:session_prefix:talkgadget/_/widget"},"plus_followers":{"params":{"url":""},"url":":socialhost:/_/im/_/widget/render/plus/followers?usegapi\u003d1"},"photocomments":{"url":":socialhost:/:session_prefix:_/widget/render/photocomments?usegapi\u003d1"},"post":{"params":{"url":""},"url":":socialhost:/:session_prefix::im_prefix:_/widget/render/post?usegapi\u003d1"},":gplus_url:":"https://plus.google.com","signin":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/widget/render/signin?usegapi\u003d1","methods":["onauth"]},"rbr_i":{"params":{"url":""},"url":":socialhost:/:session_prefix::se:_/widget/render/recobarinvitation"},"share":{"url":":socialhost:/:session_prefix::im_prefix:_/widget/render/share?usegapi\u003d1"},"plusone":{"params":{"count":"","size":"","url":""},"url":":socialhost:/:session_prefix::se:_/+1/fastbutton?usegapi\u003d1"},"comments":{"params":{"location":["search","hash"]},"url":":socialhost:/:session_prefix:_/widget/render/comments?usegapi\u003d1","methods":["scroll","openwindow"]},":im_socialhost:":"https://plus.googleapis.com","backdrop":{"url":"https://clients3.google.com/cast/chromecast/home/widget/backdrop?usegapi\u003d1"},"visibility":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/widget/render/visibility?usegapi\u003d1"},"autocomplete":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/widget/render/autocomplete"},"additnow":{"url":"https://apis.google.com/additnow/additnow.html?usegapi\u003d1","methods":["launchurl"]},":signuphost:":"https://plus.google.com","appcirclepicker":{"url":":socialhost:/:session_prefix:_/widget/render/appcirclepicker"},"follow":{"url":":socialhost:/:session_prefix:_/widget/render/follow?usegapi\u003d1"},"community":{"url":":ctx_socialhost:/:session_prefix::im_prefix:_/widget/render/community?usegapi\u003d1"},"sharetoclassroom":{"url":"https://www.gstatic.com/classroom/sharewidget/widget_stable.html?usegapi\u003d1"},"ytshare":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/widget/render/ytshare?usegapi\u003d1"},"plus":{"url":":socialhost:/:session_prefix:_/widget/render/badge?usegapi\u003d1"},"reportabuse":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/widget/render/reportabuse?usegapi\u003d1"},"commentcount":{"url":":socialhost:/:session_prefix:_/widget/render/commentcount?usegapi\u003d1"},"configurator":{"url":":socialhost:/:session_prefix:_/plusbuttonconfigurator?usegapi\u003d1"},"zoomableimage":{"url":"https://ssl.gstatic.com/microscope/embed/"},"savetowallet":{"url":"https://clients5.google.com/s2w/o/savetowallet"},"person":{"url":":socialhost:/:session_prefix:_/widget/render/person?usegapi\u003d1"},"savetodrive":{"url":"https://drive.google.com/savetodrivebutton?usegapi\u003d1","methods":["save"]},"page":{"url":":socialhost:/:session_prefix:_/widget/render/page?usegapi\u003d1"},"card":{"url":":socialhost:/:session_prefix:_/hovercard/card"}}},"h":"m;/_/scs/apps-static/_/js/k\u003doz.gapi.en_US.xeWoVlLVtrU.O/m\u003d__features__/am\u003dAQ/rt\u003dj/d\u003d1/t\u003dzcms/rs\u003dAGLTcCP5mTUhhom0stridYR0GRk7St_PIQ","u":"https://apis.google.com/js/api.js","hee":true,"fp":"8d2a9a34a178e440a64fd488e1e80b24a31500c4","dpo":false},"fp":"8d2a9a34a178e440a64fd488e1e80b24a31500c4","annotation":["interactivepost","recobar","signin2","autocomplete","profile"],"bimodal":["signin","share"]}});
   