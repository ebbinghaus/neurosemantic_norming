// $(function() {
//     $("#slider,#slider2").slider({
//         range: "min",
//         value: 0,
//         min: 1,
//         max: 100,
//         step: 1
//         // range:"min",
//         // animate: true
//         // slide: function( event, ui ) {
//         //     $( "#amount" ).val( "$" + ui.value );
//         // }
//     });
//     // $( "#amount" ).val( "$" + $( "#slider" ).slider( "value" ) );
// });



function makeSlider(r) {

    $(function() {
        $("#slider" + r).slider({
            range: "min",
            value: 0,
            min: 1,
            max: 100,
            step: 1
            // range:"min",
            // animate: true
            // slide: function( event, ui ) {
            //     $( "#amount" ).val( "$" + ui.value );
            // }
        });
    });
}

function makeDiv(divID, divClass) {
    var mDiv = document.createElement('div');
    mDiv.setAttribute("class", divClass);
    mDiv.setAttribute("id", divID);
    return mDiv
}


// Clears all children of the element with ID nodeID

function clearNode(nodeID) {
    var myNode = document.getElementById(nodeID);
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}



// Make the button. dest is the ID of the destination (likely the container)

function makeButton(destID, callback) {
    var mbutton = document.createElement('a');
    mbutton.setAttribute("class", "btn btn-primary btn-lg pull-right")
    mbutton.setAttribute("role", "button")
    mbutton.setAttribute("onclick", "makeSlidertrons(all_trials)")
    mbutton.setAttribute("id", "thebutton")
    mbutton.innerHTML = "Next word &raquo;"
    document.getElementById(destID).appendChild(mbutton)
}


// ---------- DEFINE SOME STIMULUS AND PROMPT STRINGS --------------
var low_anch = "not at all"
var nodeID_anch = "somewhat"
var high_anch = "very much so"

var feat1 = "I associate this word with relationships or interactions between people.";
var feat2 = "I associate this word with houses or other buildings.";
var feat3 = "I associate this word with faces."
var feat4 = "I associate this word with other parts of the body."
var feat5 = "I associate this word with a certain visual appearance, shape, or image."
var feat6 = "I associate this word with sound."
var feat7 = "I associate this word with counting, measuring, size, or quantity."
var feat8 = "I associate this word with motion."
var feat9 = "I associate this word with taste or smell."
var feat10 = "I associate this word with human emotion."
var feat11 = "I associate this word with touch or texture."
var feat12 = "I associate this word with color."
var feat13 = "I associate this word with manipulation."
var feat14 = "I associate this word with physical action."
var feat15 = "I think of this thing as either natural or artificial/manmade."

all_trials = [{
    "word": "duck",
    "sentence": "The scientist watched the duck.",

    "features": [{
        "feat": feat1
    }, {
        "feat": feat2
    }, {
        "feat": feat3
    }, {
        "feat": feat4
    }, {
        "feat": feat5
    }]
}, {
    "word": "street",
    "sentence": "The street was empty.",
    "features": [{
        "feat": feat6
    }, {
        "feat": feat7
    }, {
        "feat": feat8
    }, {
        "feat": feat9
    }, {
        "feat": feat10
    }]
}, {
    "word": "kick",
    "sentence": "The horse kicked the fence.",
    "features": [{
        "feat": feat11
    }, {
        "feat": feat12
    }, {
        "feat": feat13
    }, {
        "feat": feat14
    }, {
        "feat": feat15
    }]
}, {
    "word": "lemon",
    "sentence": "The lemon was on the table.",
    "features": [{
        "feat": feat7
    }, {
        "feat": feat8
    }, {
        "feat": feat9
    }, {
        "feat": feat10
    }, {
        "feat": feat11
    }]
}]


// all_trials is a json of words, sentences, and features
// original_length is the length of all_trials (n trials) before any shifting

function makeSlidertrons(all_trials, original_length) {

    // console.log(original_length)

    //  If there's anything in the all_trials array. Grab a frame of all_trials and show it.
    if (all_trials.length > 0) {

        ctrial = all_trials.shift()


        // Print out the values from last trial and reset the slider values to zero.
        // This isn't good. We should get the slider values on the button click

        // 3/25/14: this uses the length of features on the
        // current trial so if the number of trials on the last trials was greater it will not reset them all.
        // 3/25/14: runs on trial 1 before sliders are created. No problem except console complains.
        for (r = 0; r < ctrial.features.length; r++) {

            console.log($("#slider" + r).slider("value"))
            $("#slider" + r).slider("value", 0);
        }


        // If it's the first trial make the jumbotron and sliders. 
        // This assumes that all frames of all_trials have same number of features.
        if (all_trials.length == original_length - 1) {

            // console.log('hi')

            var jumboDiv = makeDiv("jumbotron1", "jumbotron")
            var mh1 = document.createElement('h1')
            var mh3 = document.createElement('h3')
            mh1.setAttribute("id", "theword")
            mh3.setAttribute("id", "thesentence")
            document.getElementById("jumbodiv").appendChild(jumboDiv)
            document.getElementById(jumboDiv.id).appendChild(mh1)
            document.getElementById(jumboDiv.id).appendChild(mh3)

            for (r = 0; r < ctrial.features.length; r++) {

                makeSlider(r)

                var divID = "slidertron" + r;
                var c = "slidertron";
                mDiv = makeDiv(divID, c);
                document.getElementById("sliderdiv").appendChild(mDiv)

                var iSlider = document.createElement('div');
                iSlider.setAttribute("class", "ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all")
                iSlider.setAttribute("id", "slider" + r)

                var iP = document.createElement('p');
                iP.setAttribute("id", "feat" + r)

                document.getElementById("sliderdiv").appendChild(mDiv)
                document.getElementById(mDiv.id).appendChild(iP)
                document.getElementById(mDiv.id).appendChild(iSlider)

                var stepDiv = document.createElement('div')
                stepDiv.setAttribute("class", "steps")
                document.getElementById(mDiv.id).appendChild(stepDiv)

                var lowtick = document.createElement('div')
                lowtick.class = "tick";
                lowtick.id = "lowtick";
                lowtick.style.position = "absolute"
                lowtick.innerHTML = low_anch

                var nodeIDtick = lowtick.cloneNode('true')
                nodeIDtick.id = "nodeIDtick";
                nodeIDtick.style.left = "45%"
                nodeIDtick.innerHTML = nodeID_anch

                var hightick = nodeIDtick.cloneNode('true')
                hightick.id = "hightick";
                hightick.style.left = "90%"
                hightick.style.textAlign = "right"
                hightick.innerHTML = high_anch


                stepDiv.appendChild(lowtick)
                stepDiv.appendChild(nodeIDtick)
                stepDiv.appendChild(hightick)
            }
            makeButton(button_dest)
        }



        // Reset the word, sentence and each slider.
        theword = document.getElementById("theword")
        thesentence = document.getElementById("thesentence")
        theword.innerHTML = ctrial.word
        thesentence.innerHTML = "<br>" + ctrial.sentence

        for (r = 0; r < ctrial.features.length; r++) {
            document.getElementById("feat" + r).innerHTML = ctrial.features[r].feat
        }



    } else {

        // Clear everything if the length of all_trials < 1
        clearNode("sliderdiv")
        clearNode("jumbotron1")
        clearNode(button_dest)

        var mh1 = document.createElement('h1')
        mh1.innerHTML = "That's it!"
        document.getElementById("jumbotron1").appendChild(mh1)

    }

}

var button_dest = "buttondiv";
var original_length = all_trials.length;
// console.log(original_length)
makeSlidertrons(all_trials, original_length)