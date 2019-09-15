( function ( w, d ) {

'use strict';

w.chrome = ( ( typeof browser != 'undefined' ) && browser.runtime ) ? browser : chrome;


function get_bool( value ) {
    if ( value === undefined ) {
        return null;
    }
    if ( ( value === '0' ) || ( value === 0 ) || ( value === false ) || ( value === 'false' ) ) {
        return false;
    }
    if ( ( value === '1' ) || ( value === 1 ) || ( value === true ) || ( value === 'true' ) ) {
        return true;
    }
    return null;
}  // end of get_bool()


function get_int( value ) {
    if ( isNaN( value ) ) {
        return null;
    }
    return parseInt( value, 10 );
} // end of get_int()


function get_text( value ) {
    if ( value === undefined ) {
        return null;
    }
    return String( value );
} // end of get_text()


function get_init_function( message_type, option_name_to_function_map, namespace ) {
    var option_names = [];
    
    Object.keys( option_name_to_function_map ).forEach( function ( option_name ) {
        option_names.push( option_name );
    } );
    
    function analyze_response( response ) {
        var options = {};
        
        if ( ! response ) {
            response = {};
        }
        
        Object.keys( option_name_to_function_map ).forEach( function ( option_name ) {
            if ( ! ( response.hasOwnProperty( option_name ) ) ) {
                options[ option_name ] = null;
                return;
            }
            options[ option_name ] =  option_name_to_function_map[ option_name ]( response[ option_name ] );
        } );
        return options;
    }
    
    function init( callback ) {
        // https://developer.chrome.com/extensions/runtime#method-sendMessage
        chrome.runtime.sendMessage( {
            type : message_type
        ,   names : option_names
        ,   namespace :  ( namespace ) ? namespace : ''
        }, function ( response ) {
            var options = analyze_response( response );
            callback( options );
        } );
    }
    
    return init;
} // end of get_init_function()


function async_set_values( name_value_map ) {
    
    return new Promise( function ( resolve, reject ) {
        chrome.storage.local.set( name_value_map, function () {
            resolve( name_value_map );
        } );
    } );
    
} // end of async_set_values()


function async_get_values( name_list ) {
    
    return new Promise( function ( resolve, reject ) {
        if ( typeof name_list == 'string' ) {
            name_list = [ name_list ];
        }
        
        chrome.storage.local.get( name_list, function ( name_value_map ) {
            name_list.forEach( function ( name ) {
                if ( name_value_map[ name ] === undefined ) {
                    name_value_map[ name ] = null;
                }
            } );
            
            resolve( name_value_map );
        } );
    } );
    
} // end of async_get_values()


var twMediaDownloader_chrome_init = ( function() {
    var option_name_to_function_map = {
            OPERATION : get_bool
        ,   IMAGE_DOWNLOAD_LINK : get_bool
        ,   VIDEO_DOWNLOAD_LINK : get_bool
        ,   OPEN_MEDIA_LINK_BY_DEFAULT : get_bool
        ,   ENABLE_ZIPREQUEST : get_bool
        ,   ENABLE_FILTER : get_bool
        ,   DOWNLOAD_SIZE_LIMIT_MB : get_int
        ,   ENABLE_VIDEO_DOWNLOAD : get_bool
        ,   INCOGNITO_MODE : get_bool
        };
    
    return get_init_function( 'GET_OPTIONS', option_name_to_function_map );
} )(); // end of twMediaDownloader_chrome_init()


if ( ( typeof content != 'undefined' ) && ( typeof content.XMLHttpRequest == 'function' ) ) {
    jQuery.ajaxSetup( {
        xhr : function () {
            try {
                return new content.XMLHttpRequest();
            } catch ( e ) {}
        }
    } );
}

// content_scripts の情報を渡す
chrome.runtime.sendMessage( {
    type : 'NOTIFICATION_ONLOAD',
    info : {
        url : location.href,
    }
}, function ( response ) {
    /*
    //window.addEventListener( 'beforeunload', function ( event ) {
    //    // TODO: メッセージが送信できないケース有り ("Uncaught TypeError: Cannot read property 'sendMessage' of undefined")
    //    chrome.runtime.sendMessage( {
    //        type : 'NOTIFICATION_ONUNLOAD',
    //        info : {
    //            url : location.href,
    //            event : 'onbeforeunload',
    //        }
    //    }, function ( response ) {
    //    } );
    //} );
    */
} );


chrome.runtime.onMessage.addListener( function ( message, sender, sendResponse ) {
    switch ( message.type )  {
        case 'RELOAD_REQUEST' :
            sendResponse( {
                result : 'OK'
            } );
            
            setTimeout( () => {
                location.reload();
            }, 100 );
            break;
    }
    return true;
} );


w.is_chrome_extension = true;
w.twMediaDownloader_chrome_init = twMediaDownloader_chrome_init;
w.async_get_values = async_get_values;
w.async_set_values = async_set_values;

} )( window, document );

// ■ end of file
