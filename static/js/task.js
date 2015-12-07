/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc);

// All pages to be loaded
var pages = [
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	"instructions/instruct-4.html",
	"instructions/instruct-5.html",
	"instructions/instruct-ready.html",
	"stage.html",
	"postquestionnaire.html"
];

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	"instructions/instruct-4.html",
	"instructions/instruct-5.html",
	"instructions/instruct-ready.html"
];


var SemanticRatingTrial = function (stage_html) {
	var self = this;
	self.stage = stage_html;
	self.wordon = null;

	var low_anch = "not at all"
	var mid_anch = "somewhat"
	var high_anch = "very much so"
	self.touched = {};

	self.makeSlider = function(r, feature_text) {

	    slidertron = d3.select("#sliderdiv")
	    	.append("div")
	    	.attr("id", "slidertron" + r)
	    	.attr("class", "slidertron");

        slidertron.append("p").attr("id", "feat"+r).html(feature_text);
        slidertron.append("div")
        		  .attr("class","ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all")
        		  .attr("id", "slider" + r);

	    $(function() {
	    	self.touched["#slider"+r]=false;
	        $("#slider" + r).slider({
	            range: "min",
	            value: 0,
	            min: 1,
	            max: 100,
	            step: 1,
	            // range:"min",
	            // animate: true
	            stop: function( event, ui ) {
	                self.touched["#"+this.id]=true;
	            }
	        });
	    });

        stepdiv = slidertron.append("div")
        		  .attr("class","steps");

        stepdiv.append("div")
        		.attr("class","tick")
        		.attr("id", "lowtick")
        		.style("position","absolute")
        		.html(low_anch);

        stepdiv.append("div")
        		.attr("class","tick")
        		.attr("id", "midtick")
        		.style("position","absolute")
        		.style("left","44%")
        		.html(mid_anch);


        stepdiv.append("div")
        		.attr("class","tick")
        		.attr("id", "hightick")
        		.style("position","absolute")
        		.style("left","88%")
        		.style("text-align","right")
        		.html(high_anch);

	}


	self.dotrial = function(trial, callback) {
		psiTurk.showPage(self.stage);

	    for (r = 0; r < trial.features.length; r++) {
	    	self.makeSlider(r, trial.features[r].feat);
	    }


		d3.select("#theword").html(trial.word);
		d3.select("#thesentence").html(trial.sentence);
		self.wordon = new Date().getTime();

		/// add button
		d3.select("#buttondiv")
			.append("a")
			.attr("class", "btn btn-primary btn-lg pull-right")
			.attr("role", "button")
			.attr("id", "thebutton")
			.html("Next word &raquo;")
			.on("click", function() { 
				allclicked = true;
				for(key in self.touched) {
					if (self.touched[key]==false) { allclicked = false; } 
				}
				if (allclicked) {
					// save data here
					var rt = new Date().getTime() - self.wordon;
					ratings = d3.selectAll(".ui-slider-range-min")[0]
								.map(function(d, i) {
								 return d.style.width;
								});

					trial_desc={"phase":"TEST", "word":trial.word, "sentence":trial.sentence,"rt":rt};
					trial_desc["features"]={};
					for (var i=0; i<trial.features.length; i++) {
						trial_desc["features"][i]={}
						trial_desc["features"][i]["feat"]=trial.features[i].feat
						trial_desc["features"][i]["rating"]=ratings[i];
					}
					console.log(trial_desc);
					psiTurk.recordTrialData(trial_desc)
					callback(); 
				} else {
					//console.log(self.touched);
					alert("In order to continue, please make a rating for each item. To give the lowest response you can click somewhere in the scale and slide the mouse back to 'not at all'.");
				}
			});

	}

}



/********************
* SEMANTIC NORMING  *
********************/
// this is where the ajax call to custom.py happens
var SemanticNormingStudy = function(complete_fn) {

	var self = this;
	self.trials = [];
	self.complete_fn = complete_fn; // what to do when done

	/*
	 * loadMoreOrQuit -
	 * loads trial data via JSON request to server (see "@custom_code.route('/get_stims', methods=['GET'])" in custom.py
)
	 * if server return string 'done', will call the
	 * complete_fn callback
	 * otherwise begins iterating recursively
	 * on the loaded trial data
	 */
	self.loadMoreOrQuit = function () {
		scroll(0,0)
		// load some trials
		$.ajax({
			dataType: "json",
			//  send this user's unique id and get stimuli back
			url: "/get_stims?uniqueId="+uniqueId,
			success: function(data) {
				self.trials = data.results; // load the next few stims
				if (self.trials == "done") { 
					self.complete_fn(); // if it says we're done, then stop
				} else {
					self.doNextTrial();
				}
			}
		})
	}

	/*
	 * doNextTrial -
	 * a john mcdonnell-style recursive 
	 * function for iterating down a list
	 * of stimuli.  choose the correct
	 * trial type to perform based on specs loaded
	 * above in self.trials
	 */
	self.doNextTrial = function() {
		scroll(0,0)
		if (self.trials.length===0) {  // ran out of trial info
			// save data 
			psiTurk.saveData({
				success: function() {
					self.loadMoreOrQuit();  // after saving data check with server 
				}, 
				error: function () { 
					alert("couldn't save data!"); // could we get better error handling here, like a resubmit?
				}
			});
		}
		else {
			trial = self.trials.shift();
			trial.num = trial_num; // set up trial number
			trial_num += 1;
			trial_view = new SemanticRatingTrial("stage.html");
			if(trial_view) {
				trial_view.dotrial(trial, function () { self.doNextTrial(); });
			}
		}
	};

	self.doNextTrial();
	return this;
};

saveRatings = function(callback) {
	expdata = psiTurk.getTrialData();
	sendData = [];  // process this more
    for (t = 0; t < expdata.length; t++) {
    	if (expdata[t].trialdata.phase == "TEST") {
    		sendData.push(expdata[t].trialdata);
    	}
    }

	$.ajax({
	  dataType: "json",
	  type: "POST",
	  url: "/complete_session",
	  data: {"trialdata": JSON.stringify(sendData), "uniqueId": uniqueId},
	  success: function (data) {
	  	callback();
	  }
	});
}

/*******************
 * Run Task
 ******************/
var trial_num = 0;

$(window).load( function(){
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence
    	function() { study = new SemanticNormingStudy ( // do semantic norming
    		function() { saveRatings(
    				function() { psiTurk.saveData({success: function() { psiTurk.completeHIT();} }); }
    			);  }
    	); } // what you want to do when you are done with instructions
    );
});

// vi: noexpandtab tabstop=4 shiftwidth=4
