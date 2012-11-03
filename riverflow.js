/**
 *	riverflow app - consumes usgs waterservices
 *	@author Patrick Lewis
 *	@requires jQuery 1.4+
 */
(function($){
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
    	proxy : 'ba-simple-proxy.php',
		baseURL : "http://waterservices.usgs.gov/nwis/iv/?format=json&sites=",
		params : "&parameterCd=00060",
		// original below
		header : $('#header'),
		form : $('form#formRiver'),
		selectRiver : $('#selectRiver'),
		submitButton : $('form#formRiver #submit'),
		main : $('#main'),
		flowInfo : $('#flowInfo'),
		graph : $('#graph'),
		images : $('#images'),
		loading : $('#loading'),
		conditions : $('#conditions'),
		graphPeriod : 7,
		baseGraphURL : "http://waterdata.usgs.gov/nwisweb/graph?agency_cd=USGS&parm_cd=00060",
		baseMapURL : "http://maps.google.com/?q=",
		apiKey: '6c6069e831fb567b86c7d9b75c82624f',
		flow0 : 'Sorry but this river is bone dry. Try a spring fed river like the San Marcos til we get more rain.',
		flow1 : 'The river is pretty much just a trickle right. Not much good for floating at the moment but a good rain should bring it up',
		flow2 : 'It\'s barely moving but it should be floatable in kayaks or toobs. Be prepared to drag bottom in spots though.',
		flow3 : 'This is a pretty leisurely flow but still fun. You shouldn\'t have any problems scraping bottom in canoes at this level',
		flow4 : 'Now we\'re talking! The river is flowing pretty good but not too dangerous. If the graph shows a sharp increase over the past week it may still be rising.',
		flow5 : 'The flow is moving now! Unless this is a large volume river like the Colorado or Rio Grande you can expect some really fast moving water.',
		flow6 : 'DANGER! Possible death awaits! Unless this is a large volume river like the Colorado you may drown. Check with a local outfitter for more details on conditions before heading out'
	}, // END permanant config 
	
	// get the json feed on form submit
	init : function(config, configP) {
	
	$(flowApp.configP.form).bind('change', function(){
													
		// make sure the select option has a value
		if(!$(flowApp.configP.selectRiver).val()){
			return false;
		} 

		// remove all exiting data first
		$(flowApp.configP.conditions).empty();
		$(flowApp.configP.flowInfo).empty();
		// display loading until the data is ready
		// $(flowApp.configP.loading).fadeIn(200);
		//flowApp.config.siteId = $("#siteId").val();
		flowApp.config.riverLocation = $(flowApp.configP.selectRiver).val();
		flowApp.config.pipeURL = flowApp.configP.proxy + '?url=' + 
			encodeURIComponent(flowApp.configP.baseURL) + 
			encodeURIComponent(flowApp.config.riverLocation) + 
			encodeURIComponent(flowApp.configP.params);
		
		// return the graph and photos before hitting yahoo pipes
		// display the graph
		flowApp.displayGraph();	
		// build the flickr tags and return the images
		flowApp.buildFlickrTags();
		flowApp.getFlickrImages();
		
		$.getJSON(flowApp.config.pipeURL, function(data){

			// check if any data is returned
			if(data.contents.value.timeSeries.length === 0) {
				// if no data is returned show a message instead of old data
				flowApp.displayNoDataReturned();
			} else {
			
			$.each(data.contents.value.timeSeries, function(i,item){
			
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
			var recentInfo = '<div class="recentValue"> ' + flowApp.config.latestCfs + '<span class="cfs">cfs</span> ' + flowApp.config.siteName + '<span class="latestTime"> ' + flowApp.config.latestTime + '</span>' + '</div>';
			flowApp.saveLatestCfs(recentInfo);
			
			// create map link
			flowApp.config.mapURL = flowApp.configP.baseMapURL + flowApp.config.latitude + ',+' + flowApp.config.longitude;	
			// round decimal and show the flow conditions message
			flowApp.displayConditions(parseInt(flowApp.config.latestCfs,10));
			// display the data
			flowApp.displayData();			
			
			} // END check if any data is returned
			
			// debug - show all data
			//console.log(data.value);

		});	
		return false; // prevent click
		}); // END get json
		
	}, // END init
	
	displayData : function(){	
		// display the results
		flowApp.config.html = '<h1>' + flowApp.config.siteName + '</h1>';
		flowApp.config.html += '<h2 id="flowRate">'+ flowApp.config.latestCfs + '<abbr id="flowCfs" title="cubic feet per second">CFS</abbr>'+ '</h2>';
		flowApp.config.html += '<a id="mapLink" href="' + flowApp.config.mapURL + '">' + 'View a Map' + '</a>';
		flowApp.config.html += '<span id="latLong">Latitude: ' + flowApp.config.latitude + ' &nbsp; Longitude: ' + flowApp.config.longitude + '</span>';
		$(flowApp.configP.flowInfo).append(flowApp.config.html);
	},
	
	displayNoDataReturned : function(){
		// remove loading
		$(flowApp.configP.loading).fadeOut(200);
		$(flowApp.configP.graph).empty();
		$(flowApp.configP.images).empty();
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
		// empty first
		$('#images').empty();
		// get the new ones
		$.getJSON('http://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=' + flowApp.configP.apiKey + '&tags=' + flowApp.config.flickrTags + '&per_page=10&tag_mode=all&sort=interestingness-asc&format=json&jsoncallback=?',
	          function(data){

				//loop through the results with the following function
				$.each(data.photos.photo, function(i,item){

				    //build the url of the photo in order to link to it
				    var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg';
				    // set the photo href
					var photoHref = 'http://www.flickr.com/photos/' + item.owner + '/' + item.id;
					var photo = '<img src="' + photoURL + '" />';
					// add photo to the page 
					$("<a/>").attr("href", photoHref).appendTo(flowApp.configP.images).append(photo);
					
				}); // END $.each

		}); // END get json
	},
	
	displayGraph : function(){
		// display a graph of the flow
		flowApp.config.graphURL = flowApp.configP.baseGraphURL + '&site_no=' + flowApp.config.riverLocation + '&period=' + flowApp.configP.graphPeriod;
		flowApp.config.graphImage = '<img src="' + flowApp.config.graphURL + '"id="graph" width="576" height="400" alt="USGS Water-data graph">';
		$('#graphWrapper').html(flowApp.config.graphImage);
	},
	
	displayConditions : function(flowRate){
		// check the range of the cfs and display the appropriate message
		if (flowRate === 0) {
			$(flowApp.configP.conditions).append(flowApp.configP.flow0);
		} else if ((flowRate > 0) && (flowRate < 50)) {
			$(flowApp.configP.conditions).append(flowApp.configP.flow1);
		} else if ((flowRate > 50) && (flowRate < 100)) {
			$(flowApp.configP.conditions).append(flowApp.configP.flow2);
		} else if ((flowRate > 100) && (flowRate < 300)) {
			$(flowApp.configP.conditions).append(flowApp.configP.flow3);
		} else if ((flowRate > 300) && (flowRate < 600)) {
			$(flowApp.configP.conditions).append(flowApp.configP.flow4);
		} else if ((flowRate > 600) && (flowRate < 2000)) {
			$(flowApp.configP.conditions).append(flowApp.configP.flow5);
		} else if (flowRate > 2000) {
			$(flowApp.configP.conditions).append(flowApp.configP.flow6);
		} 
	},
	
	saveLatestCfs : function(recentInfo){
		// save the latest cfs value and display recentInfo
		localStorage.recentInfo = recentInfo;
		$(flowApp.configP.header).append(localStorage.recentInfo);
		
	}
	
};
$(document).ready(function() { 
	flowApp.init();
	// check the window width and add appropriate stylesheet
	// TODO: remove this code and replace with css media queries
	function setStyle(width) {
		var windowWidth = parseInt(width, 10);
		flowApp.config.resizeStyle = $('#resizeStyle');
		if (windowWidth < 900) {
			flowApp.config.resizeStyle.attr("href", "small.css");
		} else if ((windowWidth >= 900) && (windowWidth < 1120)) {
			flowApp.config.resizeStyle.attr("href", "medium.css");
		} else {
		   flowApp.config.resizeStyle.attr("href", "wide.css");
		}
	}
	// check the window width on resize
	$(function() {
		setStyle($(this).width());
		$(window).resize(function() {
			setStyle($(this).width());
		});
	});

});
}(jQuery));