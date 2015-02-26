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
        resizeStyle : ""
    }, // END config

    configP : {
        baseURL : "http://waterservices.usgs.gov/nwis/iv/?format=json&sites=",
        params : "&parameterCd=00060",
        form : $('form#formRiver'),
        selectRiver : $('#selectRiver'),
        submitButton : $('form#formRiver #submit'),
        bodyTag : document.getElementsByTagName('body')[0],
        graph : $('#graph'),
        images : $('.image-wrapper'),
        loading : $('.loading-message'),
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

    }, // END init

    events: function() {
        $(flowApp.configP.form).on('change', this.getUsgsData);
    },

    getCompleteRiverData: function() {
        // http://waterservices.usgs.gov/nwis/iv/?format=json&sites=08155200,08155240,08155300,08155400&parameterCd=00060,00065
    },

    getUsgsData: function() {
        // fetches usgs instant data, usgs graph service, and flickr
        // make sure the select option has a value
        if(!$(flowApp.configP.selectRiver).val()){
            return false;
        }

        // remove all exiting data first
        $(flowApp.configP.conditions).empty();
        // display loading until the data is ready
        flowApp.configP.loading.removeClass('hidden');
        flowApp.configP.bodyTag.className = 'loading';

        //flowApp.config.siteId = $("#siteId").val();
        flowApp.config.riverLocation = $(flowApp.configP.selectRiver).val();

        flowApp.config.pipeURL =  flowApp.configP.baseURL +
            flowApp.config.riverLocation +
            flowApp.configP.params;

        // return the graph and photos before hitting yahoo pipes
        // display the graph
        flowApp.displayGraph();
        // build the flickr tags and return the images
        flowApp.buildFlickrTags();
        flowApp.getFlickrImages();

        $.getJSON(flowApp.config.pipeURL, function(data){

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
            if (todaysDate === timeDate) {
              timeDate = 'Today';
            }
            flowApp.config.latestTime = timeDate + ' at ' + timeHours;

            // save the name,cfs and display
            var recentInfo = '<div class="recentValue">' + flowApp.config.latestCfs +
                '<abbr class="cfs" title="cubic feet per second">cfs</abbr> <span class="name">' +
                flowApp.config.siteName + '</span><span class="latestTime"> ' +
                flowApp.config.latestTime + '</span>' + '</div>';

            flowApp.saveLatestCfs(recentInfo);

            // create map link
            flowApp.config.mapURL = flowApp.configP.baseMapURL + flowApp.config.latitude + ',+' + flowApp.config.longitude;
            // round decimal and show the flow conditions message
            flowApp.displayConditions(parseInt(flowApp.config.latestCfs,10));
            // display the data
            flowApp.displayData();

            flowApp.configP.loading.addClass('hidden');

            } // END check if any data is returned

            // debug - show all data
            //console.log(data.value);
            flowApp.configP.bodyTag.className = '';

        });
        return false; // prevent click

    },

    displayData: function() {
        // display tiles: siteName, flowRate, mapLinkLatLong

        // site name
        flowApp.config.siteName = '<h1>' + flowApp.config.siteName + '</h1>';
        $('.siteName').html(flowApp.config.siteName);

        // mapLinkLatLong
        var mapLinkLatLong = '<a href="' + flowApp.config.mapURL + '">' + 'View a Map' + '</a>';
        mapLinkLatLong += 'Latitude: ' + flowApp.config.latitude + ' &nbsp; Longitude: ' + flowApp.config.longitude;

        //flowRate
        var flowRateText = '<h2>'+ flowApp.config.latestCfs + '<abbr id="flowCfs" title="cubic feet per second">CFS</abbr>'+ '</h2>';
        flowRateText += '<div class="mapLinkLatLong">' + mapLinkLatLong + '</div>';

        $('.flowRate').html(flowRateText);



        //$('.mapLinkLatLong').html(mapLinkContainer);
    },

    displayNoDataReturned : function(){
        console.error('No data returned from the endpoint');
        // remove loading
        flowApp.configP.loading.removeClass('hidden');
        flowApp.configP.images.empty();
        flowApp.config.resultsMessage = "No flow information was returned from the  USGS.<br/>Try again soon to get the most recent cfs and map link.";
        // display the results
        flowApp.buildFlickrTags();
        flowApp.getFlickrImages();
        // display message
        flowApp.config.html = '<h2>' + flowApp.config.resultsMessage + '</h2>';
        $(flowApp.configP.flowInfo).append(flowApp.config.html);
        // display the graph
        flowApp.displayGraph();
    },

    buildFlickrTags : function(){
        // get the tags from the select option text and trim everything after ':'
        flowApp.config.flickrTags = $('#selectRiver option:selected').text().replace(/:.*/, '');
        flowApp.config.flickrTags = 'kayak%2C' + flowApp.config.flickrTags;
        // flickr api only accepts 2 tags, but the text option searches tags, title & description
        // combine the river name and keep 'kayak' as the other tag
        flowApp.config.flickrTags = flowApp.config.flickrTags.replace(/\s+/g, '+');
    },

    getFlickrImages : function(){
        // create document fragment to add all at once
        var docFrag = document.createDocumentFragment();
        // get the new ones
        $.getJSON('https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=' + flowApp.configP.apiKey + '&tags=' + flowApp.config.flickrTags + '&per_page=10&tag_mode=all&sort=interestingness-asc&format=json&jsoncallback=?',
              function(data){

                //loop through the results with the following function
                $.each(data.photos.photo, function(i,item){

                    //build the url of the photo in order to link to it
                    var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg';
                    // set the photo href
                    var photoHref = '//www.flickr.com/photos/' + item.owner + '/' + item.id;
                    var photo = '<img src="' + photoURL + '" />';
                    // add photo to the page
                    $("<a/>").attr("href", photoHref).appendTo(docFrag).append(photo);

                }); // END $.each

                // append once
                flowApp.configP.images.html(docFrag);

        }); // END get json
    },

    displayGraph : function(){
        // display a graph of the flow
        flowApp.config.graphURL = flowApp.configP.baseGraphURL + '&site_no=' + flowApp.config.riverLocation + '&period=' + flowApp.configP.graphPeriod;
        flowApp.config.graphImage = '<img src="' + flowApp.config.graphURL + '"id="graph" alt="USGS Water-data graph">';
        $('.graph-wrapper').html(flowApp.config.graphImage);
    },

    displayConditions : function(flowRate) {
        var conditions = $('.conditions'),
            conditionText = '';

        // check the range of the cfs and display the appropriate message
        if (flowRate === 0) {
            conditionText = flowApp.configP.flow0;
        } else if ((flowRate > 0) && (flowRate < 50)) {
            conditionText = flowApp.configP.flow1;
        } else if ((flowRate > 50) && (flowRate < 100)) {
            conditionText = flowApp.configP.flow2;
        } else if ((flowRate > 100) && (flowRate < 300)) {
            conditionText = flowApp.configP.flow3;
        } else if ((flowRate > 300) && (flowRate < 600)) {
            conditionText = flowApp.configP.flow4;
        } else if ((flowRate > 600) && (flowRate < 2000)) {
            conditionText = flowApp.configP.flow5;
        } else if (flowRate > 2000) {
            conditionText = flowApp.configP.flow6;
        } else {
            console.error('no flow rate conditions met. flowRate = ' + flowRate);
        }

        conditions.html(conditionText);
    },

    saveLatestCfs : function(recentInfo){
        // save the latest cfs value and display recentInfo
        localStorage.recentInfo = recentInfo;
        $('.recentValueWrapper').prepend(localStorage.recentInfo);

    }

};
$(document).ready(function() {
    flowApp.init();
    $('html').removeClass('no-js').addClass('js');
});
}());
