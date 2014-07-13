/*
   MPFinder main.js
   Built in the UK with love by Jamie Hoyle and Ross Penman
*/

/*
  All functions that are specific to a country.
    * Should be relatively easy to modify based on the data you get back.
 */

var config = {
  //structure: 'http://postcodes.cloudapp.net/postcode/' + postcode
  'postcodeBaseUrl': 'http://postcodes.cloudapp.net/postcode/',
  //structure: config.latlngBaseUrl + lat + '/' + lng
  'latlngBaseUrl': 'http://postcodes.cloudapp.net/latlng/',
  //structure: http://jamiehoyle.com/mp (in <a href="" things)
  'siteUrl': 'http://jamiehoyle.com/mp'
}

var localised = {
  displayMP: function(cons) {
    //find constituency name
    $.get('data.json', function(data) {
      //iterate through the data.json file
      $.each(data, function(i, v) {
        //check for match
        if (v.constituency == cons) {
          //add the constituency name to the URL
          consURI = encodeURIComponent(cons);
          window.location.hash = consURI;
          //render the data, in a horrible horrible way
          $('#header p').hide();
          $('.longer').hide();
          $('.waiting').fadeOut(250);
          $('article').fadeIn(500);
          $('.shareables').fadeIn(1000);
          $('#moreInformation').slideUp(250);
          $('#mpName').text('Your MP is ' + v.name.slice(0, -3));
          $('.mpNameModal').text(v.name);
          $('#mpConstituency').text(v.constituency);
          $('#mpEmail').html('<a href="mailto:' + v.email + '">' + v.email + '</a>');
          $('#emailModal h3').text(v.email);
          $('#mpTel').html('<a href="tel:"' + v.tel + '">' + v.tel + '</a>');
          $('#phoneModal h3').text(v.tel);
          $('#mpWebsite').html('<a target="_blank" href="' + v.website + '">' + v.website + '</a>');
          $('#callMP').attr('href', 'tel:' + v.tel);
          $('#emailMP').attr('href', 'mailto:' + v.email);
          $('#permalink').html('<a href="' + config.siteUrl + '/#' + consURI + '">Permalink</a>');
          //style based on parties
          if(v.party == 'Conservative') {
            $('article').css('background', '#3498db');
          } else if(v.party == 'Labour') {
            $('article').css('background', '#e74c3c');
          } else if(v.party == 'Liberal Democrat') {
            $('article').css('background', '#f39c12');
          } else if(v.party == 'Green') {
            $('article').css('background', '#16a085');
          } else if(v.party == 'Plaid Cymru') {
            $('article').css('background', '#3F8428');
          } else if(v.party == 'Scottish National') {
            $('article').css('background', '#FFF95D');
          } else if(v.party == 'Democratic Unionist') {
            $('article').css('background', '#19283e');
          } else if(v.party == 'Sinn Fein') {
            $('article').css('background', '#006837');
          } else if(v.party == 'Social Democratic \u0026 Labour Party') {
            $('article').css('background', '#018562');
          } else if(v.party == 'Respect') {
            $('article').css('background', 'red');
          } else if(v.party == 'Alliance') {
            $('article').css('background', '#f2d303');
          } else {
            //we tried, honestly
            $('article').css('background', '#bdc3c7');
          }
          all.loaded = 1;
          return;
        }
      });
    })
  },

  manualEntry: function(postcode) {
      $('.waiting').fadeIn(250);
      setTimeout(timed, 15000);
      $.ajax({
        url: config.postcodeBaseUrl + postcode,
        jsonpCallback: 'localised.setMPManual',
        dataType: 'jsonp'
      });
  },

  setMP: function(data) {
      //don't display the "welcome" message again
      if (Modernizr.localstorage) {
        localStorage.setItem('hasLaunched', 'yes');
      }
      data = $.parseJSON(data);
      //display the MP, based on the constituency title.
      localised.displayMP(data.administrative.constituency.title);
  },

  setMPManual: function(data) {
    //don't display the "welcome" message again
    if (Modernizr.localstorage) {
      //manual not used at the moment.
      localStorage.setItem('manual', 'yes');
    }
    data = $.parseJSON(data);
    localised.displayMP(data.administrative.constituency.title);
  },

  getCoords: function(position) {
    //get latitude and longitude
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    //make request to postcode API
    $.ajax({
      url: config.latlngBaseUrl + lat + '/' + long,
      jsonpCallback: 'localised.setMP',
      dataType: 'jsonp'
    });
  },
}

/*
 * All functions that are country-agnostic.
 */
var all = {
  //set the page
  loaded: 0,

  timed: function() {
    if(all.loaded == 0) {
    $('header').append('<p class="longer">This request is taking slightly longer than usual. You can wait, reload this page, or try the manual entry link above.</p>');
    }
  },

  getLocation: function() {
    //check for geolocation support
    if (Modernizr.geolocation) {
      //get lat/long
      navigator.geolocation.getCurrentPosition(localised.getCoords);
      $('.waiting').fadeIn(250);
      setTimeout(all.timed, 15000);
      //get postcode
    } else {
      //unsupported
      $('#welcome').append('<br/><b>Your browser does not support gelocation. Please click on the link above.</b>');
    }
  }
}

//deal with document ready items.
$(document).ready(function() {
  //check if we've launched
  var hasLaunched = localStorage.getItem('hasLaunched');
  //edit the welcome message to suit:
  if(window.location.hash) {
    //if the user has arrived from a permalink
    $('#welcome').html('You arrived at MPFinder from a permalink. If you would rather find your own MP, click <a href="' + config.siteUrl + '">here</a>.');
  } else if(hasLaunched == 'yes') {
    //if the user has used MPFinder before, don't ask them to accept a geolocation request
    $('#welcome').html('We&#39;re going to use your geolocation settings from last time. If you would rather enter a postcode manually, please click <a href="#" class="geoOptOut">here</a>.');
  } else {
    //if the user hasn't used it before, guide them through the geolocation request.
    $('#welcome').html('Welcome to MPFinder. Please click &quot;allow&quot; on the Geolocation request that will appear. If you don&#39;t want to use Geolocation, please click <a href="#" class="geoOptOut">here</a>.')
  }

  //check if a URL fragment exists
  if(window.location.hash) {
    // Fragment exists, use that
    var constituency = decodeURIComponent(window.location.hash.substring(1));
    // skip requests to API, we can just send the non-encoded constituency to our displayMP function
    localised.displayMP(constituency);
  } else {
    // Fragment doesn't exist, start location request
    all.getLocation();
  }
})

/*
  Ways to handle events
 */

/*
  show an input form if the user requests it
  TODO: make this nicer and don't rely on $.html
 */
$(document.body).on('click', '.geoOptOut', function(event) {
  event.preventDefault();
  $('.search').html('<input id="postcodeManual" placeholder="SW1A 2AA" /><button id="submitManual">Find</button>');
})

/*
  send a postcode across to a function
*/
$(document.body).on('click', '#submitManual', function(event) {
  var postcode = $('#postcodeManual').val();
  localised.manualEntry(postcode);
})

/*
  show more information for a representative if requested
 */
$('.moreInfo').on('click', function(event) {
  event.preventDefault();
  $('#moreInformation').slideDown(250);
  $('.moreInfo').hide();
})

/*
  show some modal dialogs only on big (assumed desktop) screens.
 */
$('#emailMP').on('click', function() {
  //assume mobile has less than 1024px width
  if (Modernizr.mq('only screen and (max-width: 1024px)')) {
    //don't show modal
  } else {
    $('#emailModal').modal();
  }
})

$('#callMP').on('click', function() {
  //assume mobile has less than 1024px width
  if (Modernizr.mq('only screen and (max-width: 1024px)')) {
    //don't show modal
  } else {
    $('#phoneModal').modal();
  }
})
