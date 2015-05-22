/**
 *  riverflow app - consumes usgs waterservices and flickr api
 *  @author Patrick Lewis
 *  @requires jQuery 1.4+
 */
;(function() {

var flowApp = {

    config : {
        siteId : "",
        riverLocation : "",
        pipeURL : "",
        siteName : "",
        graphURL : "",
        graphImage : "",
        mapURL : "",
        mapMessage : "",
        latitude : "",
        longitude : "",
        totalCount : "",
        latestCfs : "",
        latestTime : "",
        resultsMessage : "",
        html : "",
        flickrTags : "",
        flickrURL : "",
        resizeStyle : "",
        baseURL : "http://waterservices.usgs.gov/nwis/iv/?format=json&sites=",
        params : "&parameterCd=00060",
        form : document.getElementById('formRiver'),
        selectRiver : document.getElementById('selectRiver'),
        bodyTag : document.getElementsByTagName('body')[0],
        graph : document.getElementById('graph'),
        images : document.querySelector('.image-wrapper'),
        loading : document.querySelector('.loading-message'),
        graphPeriod : 7,
        baseGraphURL : "http://waterdata.usgs.gov/nwisweb/graph?agency_cd=USGS&parm_cd=00060",
        baseMapURL : "http://maps.google.com/?q=",
        apiKey: '6c6069e831fb567b86c7d9b75c82624f',
        flow0 : 'Sorry but this river is bone dry. Try a spring fed river like the San Marcos til we get more rain.',
        flow1 : 'The river is pretty much just a trickle right. Not much good for floating at the moment but a good rain should bring it up',
        flow2 : 'It\'s barely moving but it should be floatable in kayaks or tubes. Be prepared to drag bottom in spots though.',
        flow3 : 'This is a pretty leisurely flow but still fun. You shouldn\'t have any problems scraping bottom in canoes at this level',
        flow4 : 'Now we\'re talking! The river is flowing pretty good but not too dangerous. If the graph shows a sharp increase over the past week it may still be rising.',
        flow5 : 'The flow is moving now! Unless this is a large volume river like the Colorado or Rio Grande you can expect some really fast moving water.',
        flow6 : 'DANGER! Possible death awaits! Unless this is a large volume river like the Colorado you may drown. Check with a local outfitter for more details on conditions before heading out'
    }, // END permanant config

    // get the json feed on form submit
    init : function() {

        this.events();

        this.router();

    }, // END init

    events: function() {
        // river selector
        $(flowApp.config.form).on('change', this.getUsgsData);

        // view larger image
        $(flowApp.config.images).on('click', 'a', this.getFlickrImage);
    },

    router: function(data) {
        var that = this;

        app_router.on('route:selectRiver', function(actions) {

            that.getUsgsData(actions);

        });

        // Start Backbone history a necessary step for bookmarkable URL's
        Backbone.history.start({
            //root: "/",
            pushState: false
        });

    },

    getCompleteRiverData: function() {
        // http://waterservices.usgs.gov/nwis/iv/?format=json&sites=08155200,08155240,08155300,08155400&parameterCd=00060
    },

    formatRiverName: function(name) {
        //console.log(name);
        // parse the value (San Marcos River : Luling)
        // to this (sanmarcos:luling)
        var formatted = name;
        formatted = formatted.toLowerCase();
        formatted = formatted.replace(/ /g,''); // replace spaces
        formatted = formatted.replace(/(\r\n|\n|\r)/gm,''); // remove line breaks
        formatted = formatted.replace(/\-(\S*)\-/g,''); // exclude titles (i.e. --brazosriverbasin--)

        return formatted;
    },

    getUsgsData: function(river) {
        // fetches usgs instant data, usgs graph service, and flickr
        // check if routed here
        if(typeof(river) === 'string') {
            var options = document.querySelectorAll('#selectRiver option');
            // set the selected option
            _.each(options, function(option, i) {
                if(flowApp.formatRiverName(option.textContent) === river) {
                    option.selected = 'selected';
                }
            });

        } else {
            // selected so update url
            var selected = document.querySelector('#selectRiver option:checked').textContent;

            selected = flowApp.formatRiverName(selected);
            // update the url but do not trigger route
            app_router.navigate(selected, {trigger: false, replace: true});

        }

        // make sure the select option has a value
        if(!$(flowApp.config.selectRiver).val()){
            return false;
        }

        // remove all existing data first
        $(flowApp.config.conditions).empty();
        // display loading until the data is ready
        flowApp.config.loading.classList.remove('hidden');
        flowApp.config.bodyTag.classList.add('loading');

        //flowApp.config.siteId = $("#siteId").val();
        flowApp.config.riverLocation = $(flowApp.config.selectRiver).val();

        flowApp.config.pipeURL =  flowApp.config.baseURL +
            flowApp.config.riverLocation +
            flowApp.config.params;

        // display the graph
        flowApp.displayGraph();
        // build the flickr tags and return the images
        flowApp.buildFlickrTags();
        flowApp.getFlickrImages();

        $.getJSON(flowApp.config.pipeURL, function(data){})
        .success(function(data) {
            // check if any data is returned
            if(data.value.timeSeries.length === 0) {
                // if no data is returned show a message instead of old data
                flowApp.displayNoDataReturned();
            } else {

            $.each(data.value.timeSeries, function(i,item){

                // set the data variables for display
                flowApp.config.siteName = item.sourceInfo.siteName;
                flowApp.config.latitude = item.sourceInfo.geoLocation.geogLocation.latitude;
                flowApp.config.longitude = item.sourceInfo.geoLocation.geogLocation.longitude;
                flowApp.config.totalCount = item.values.count;
                // set cfs value
                flowApp.config.latestCfs = item.values[0].value[0].value;
                // set date
                flowApp.config.latestTime = item.values[0].value[0].dateTime;

            }); // END $.each

            // get todays date and trim hours
            var todaysDate = new Date();
            todaysDate = todaysDate.toDateString();

            // create latest cfs date object
            var d = new Date(flowApp.config.latestTime);
            var timeDate = d.toDateString();
            var timeHours = d.toLocaleTimeString();

            // compare todays date with the latest returned time
            // TODO: this logic is flawed, should return time and format from localStorage
            // if (todaysDate === timeDate) {
            //     timeDate = 'Today';
            // }
            flowApp.config.latestTime = timeDate + ' at ' + timeHours;

            // save the name,cfs and display
            var recentInfo = '<div class="recentValue">' + flowApp.config.latestCfs +
                '<abbr class="cfs" title="cubic feet per second">cfs</abbr> <span class="name">' +
                flowApp.config.siteName + '</span><span class="latestTime"> ' +
                flowApp.config.latestTime + '</span>' + '</div>';

            flowApp.saveLatestCfs(recentInfo);

            // create map link
            flowApp.config.mapURL = flowApp.config.baseMapURL + flowApp.config.latitude + ',+' + flowApp.config.longitude;
            // round decimal and show the flow conditions message
            flowApp.displayConditions(parseInt(flowApp.config.latestCfs,10));
            // display the data
            flowApp.displayData();

            } // END check if any data is returned

            // debug - show all data
            //console.log(data.value);
            flowApp.config.bodyTag.className = '';

            flowApp.config.loading.classList.add('hidden');

        })
        .error(function(msg) {
            var statusText = msg.statusText;
            console.warn(statusText);
        }); // END get json

        return false; // prevent click

    },

    displayData: function() {
        // display tiles: siteName, flowRate, mapLinkLatLong
        var siteName = document.querySelector('.siteName');
        var flowRate = document.querySelector('.flowRate');
        // site name
        // NOTE: not displayed at this time
        if(siteName) {
            flowApp.config.siteName = '<h1>' + flowApp.config.siteName + '</h1>';
            siteName.textContent = flowApp.config.siteName;
        }

        // mapLinkLatLong
        var mapLinkLatLong = '<a href="' + flowApp.config.mapURL + '">' + 'View a Map' + '</a>';
        mapLinkLatLong += 'Latitude: ' + flowApp.config.latitude + ' &nbsp; Longitude: ' + flowApp.config.longitude;

        //flowRate
        var flowRateText = '<h2>'+ flowApp.config.latestCfs + '<abbr id="flowCfs" title="cubic feet per second">CFS</abbr>'+ '</h2>';
        flowRateText += '<div class="mapLinkLatLong">' + mapLinkLatLong + '</div>';

        flowRate.innerHTML = flowRateText;

        //$('.mapLinkLatLong').html(mapLinkContainer);
    },

    displayNoDataReturned : function() {
        console.error('No data returned from the endpoint');
        // remove loading
        $(flowApp.config.loading).removeClass('hidden');
        $(flowApp.config.images).empty();
        flowApp.config.resultsMessage = "No flow information was returned from the  USGS.<br/>Try again soon to get the most recent cfs and map link.";
        // display the results
        flowApp.buildFlickrTags();
        flowApp.getFlickrImages();
        // display message
        flowApp.config.html = '<h2>' + flowApp.config.resultsMessage + '</h2>';
        $(flowApp.config.flowInfo).append(flowApp.config.html);
        // display the graph
        flowApp.displayGraph();
    },

    buildFlickrTags: function() {
        // get the tags from the select option text and trim everything after ':'
        flowApp.config.flickrTags = $('#selectRiver option:selected').text().replace(/:.*/, '');
        flowApp.config.flickrTags = 'kayak%2C' + flowApp.config.flickrTags;
        // flickr api only accepts 2 tags, but the text option searches tags, title & description
        // combine the river name and keep 'kayak' as the other tag
        flowApp.config.flickrTags = flowApp.config.flickrTags.replace(/\s+/g, '+');
    },

    getFlickrImages: function() {
        // create document fragment to add all at once
        var baseURL = 'https://api.flickr.com/services/rest/?&method=flickr.photos.search';
        var docFrag = document.createDocumentFragment();
        // get the new ones
        $.getJSON(baseURL +
            '&api_key=' + flowApp.config.apiKey +
            '&tags=' + flowApp.config.flickrTags +
            '&per_page=' + 10 +
            '&tag_mode=' + 'all' +
            '&sort=' + 'interestingness-asc' +
            '&format=' + 'json' +
            '&jsoncallback=' + '?',
            function(data){})
            .success(function(data) {

                //loop through the results with the following function
                $.each(data.photos.photo, function(i,item){

                    var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret;
                    var square = photoURL  + '_q.jpg'; // q = 150sq
                    var photoMedium = photoURL  + '_m.jpg'; // m = 240long
                    var photoLarge = photoURL  + '_b.jpg'; // b = 1024 on longest side,
                    // set the photo href for larger views
                    var photoHref = '//www.flickr.com/photos/' + item.owner + '/' + item.id;
                    var photo = '<img src="' + square + '" />';
                    // add photo to the docFrag
                    $("<a/>").attr("href", photoLarge)
                        .attr('rel', 'prefetch')
                        .attr('data-photohref', photoHref)
                        .attr('data-largeurl', photoLarge)
                        .attr('data-lightbox','kayaking')
                        .appendTo(docFrag).append(photo);

                }); // END $.each

                // append once
                // TODO: why does this insert [object DocumentFragment]
                //flowApp.config.images.innerHTML = docFrag;
                $(flowApp.config.images).html(docFrag);

            })
            .error(function(msg) {
                console.log(msg);
            })
            .done(function(data) {
            }); // END get json

    },

    getFlickrImage: function(e) {
        // NOTE: using lightbox to handle the large images
        // build url: https://www.flickr.com/services/api/misc.urls.html
        // or make request with getInfo: https://www.flickr.com/services/api/flickr.photos.getInfo.html
        e.preventDefault();
    },

    displayGraph: function(){
        // display a graph of the flow
        flowApp.config.graphURL = flowApp.config.baseGraphURL + '&site_no=' + flowApp.config.riverLocation + '&period=' + flowApp.config.graphPeriod;
        flowApp.config.graphImage = '<img src="' + flowApp.config.graphURL + '"id="graph" alt="USGS Water-data graph">';

        document.querySelector('.graph-wrapper').innerHTML = flowApp.config.graphImage;
    },

    displayConditions : function(flowRate) {
        var conditionText = '';

        // check the range of the cfs and display the appropriate message
        if (flowRate === 0) {
            conditionText = flowApp.config.flow0;
        } else if ((flowRate > 0) && (flowRate < 50)) {
            conditionText = flowApp.config.flow1;
        } else if ((flowRate >= 50) && (flowRate < 100)) {
            conditionText = flowApp.config.flow2;
        } else if ((flowRate >= 100) && (flowRate < 300)) {
            conditionText = flowApp.config.flow3;
        } else if ((flowRate >= 300) && (flowRate < 600)) {
            conditionText = flowApp.config.flow4;
        } else if ((flowRate >= 600) && (flowRate < 2000)) {
            conditionText = flowApp.config.flow5;
        } else if (flowRate >= 2000) {
            conditionText = flowApp.config.flow6;
        } else {
            console.error('no flow rate conditions met. flowRate = ' + flowRate);
        }

        document.querySelector('.conditions').textContent = conditionText;
    },

    saveLatestCfs : function(recentInfo){
        // saves the lastest river data to localstorage
        // and displays the list of cfs, river name and time
        // TODO: set a max entry size?
        var recent = recentInfo;

        // save the latest cfs value and display recentInfo
        if(localStorage.recentInfo) {
            localStorage.recentInfo = recent + localStorage.recentInfo;
        } else {
            localStorage.recentInfo = recent;
        }

        // show the latests value first
        // console.log(localStorage.recentInfo);
        document.querySelector('.recentValueWrapper').innerHTML = localStorage.recentInfo;

    }

};

//----- router -------
var AppRouter = Backbone.Router.extend({
    routes: {
        ":id": "selectRiver"
    }
});

// Initiate the router
var app_router = new AppRouter();

//----- helpers ------

//------ initilize ----------
$(document).ready(function() {
    flowApp.init();
    $('html').removeClass('no-js').addClass('js');
});

}());
