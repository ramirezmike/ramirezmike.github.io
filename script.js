var jambo = (function () {
    var _trackContainerHtml = `
            <div class="trackContainer">
                <div class="trackDescriptionContainer">
                    <input type='checkbox' >
                    <label>Mute Track</label>
                    <input type='checkbox' class="recordCheckbox" >
                    <label>Record</label>
                    <input type='range' min="0" max="100" style="width: 50%;">
                    <label>Volume</label>
                </div>
                <div class="measureContainer">
                </div>
            </div>
        `;
    var _currentRecordingInterval = undefined;
    var _metronomeInterval = undefined;

    function init() {
        fixMeasureIndicatorHeight();
        bindMeasureChange();
        bindBeatPerMeasureChange();
        bindRecordCheckbox();
        bindAddTrack();
        bindPlayButton();
        bindRecordButton();
        bindStopButton();
        $(".positionIndicator").draggable({ axis: "x", containment: "parent" });
        $("input").trigger("change");
        $(window).trigger("resize");
    }

    function fixMeasureIndicatorHeight() {
        $(window).on("resize", function () {
            $(".measureIndicatorContainer").css("height", $(".compositionContainer")[0].clientHeight + "px");
        });
    }

    function bindAddTrack() {
        $("body").on("click", "#addTrackButton", function (event) {
            var parentTrackContainer = $(event.target).closest(".trackContainer");
            $(parentTrackContainer).before(_trackContainerHtml);
        });
    }

    function bindRecordCheckbox() {
        $("body").on("click", ".recordCheckbox", function (event) {
            $(".recordCheckbox").prop("checked", false);
            $(event.target).prop("checked", true);
        });
    }

    function bindMeasureChange() {
        $("body").on("change", "#measureCountInput", function (event) {
            var numberOfMeasures = Number($("#measureCountInput")[0].value);
            $(".measureIndicatorContainer").html("<div class='positionIndicator'></div>");

            for (var i = 0; i < numberOfMeasures; i++) {
                $(".measureIndicatorContainer").append("<div class='measureIndicator'></div>");
            }

            $(".positionIndicator").draggable({ axis: "x", containment: "parent" });
            $(".compositionContainer").css("width", $(".measureIndicatorContainer")[0].clientWidth + "px");
            $("#beatsPerMeasure").trigger("change");
        });
    }

    function bindBeatPerMeasureChange() {
        $("body").on("change", "#beatsPerMeasure", function (event) {
            var numberOfBeats= Number($("#beatsPerMeasure")[0].value);
            $(".measureIndicator").html("");

            for (var i = 0; i < numberOfBeats; i++) {
                $(".measureIndicator").append("<div class='beatIndicator'></div>");
            }

            $(window).trigger("resize");
        });
    }

    function bindPlayButton() {
        $("body").on("click", "#playButton", function (event) {
            var compositionLength = $(".measureIndicatorContainer")[0].clientWidth - 100
            var numberOfMeasures = Number($("#measureCountInput")[0].value);
            var numberOfBeats= Number($("#beatsPerMeasure")[0].value);
            var beatsPerMinute = Number($("#bpmInput")[0].value);
            var totalNumberOfBeats = numberOfBeats * numberOfMeasures;
            var lengthOfCompositionInSeconds = (totalNumberOfBeats / beatsPerMinute) * 60;

            $(".positionIndicator").css("left", "100px");
            $(".positionIndicator").css("transition", "all " + lengthOfCompositionInSeconds + "s linear");
            $(".positionIndicator").css("transform", "translate(" + compositionLength + "px)");


            var metronomeElement = $("#metronome")[0];
            _metronomeInterval = window.setInterval(function () {
                metronomeElement.play();
            }, ((lengthOfCompositionInSeconds / totalNumberOfBeats) * 1000));

        });
    }

    function bindRecordButton() {
        $("body").on("click", "#recordButton", function (event) {
            var checkedRecordCheckbox = $(".recordCheckbox:checked")[0];

            if (!checkedRecordCheckbox) {
                alert("Must select track to record on"); 
                return;
            }

            var trackToRecordOn = $(checkedRecordCheckbox).closest(".trackContainer")[0];
            var clipContainer = $(trackToRecordOn).find(".measureContainer")[0];
            var startPosition = Number($(".positionIndicator").css("left").replace("px", "")) - 100;
            var clip = $("<div class='clip' style='left:" + startPosition + "px;position:relative;width:0px;'><div class='draggableClipHandle'></div></div>"); 
            $(clipContainer).append(clip);


            var compositionLength = $(".measureIndicatorContainer")[0].clientWidth - 100
            var numberOfMeasures = Number($("#measureCountInput")[0].value);
            var numberOfBeats= Number($("#beatsPerMeasure")[0].value);
            var beatsPerMinute = Number($("#bpmInput")[0].value);
            var totalNumberOfBeats = numberOfBeats * numberOfMeasures;
            var lengthOfCompositionInSeconds = (totalNumberOfBeats / beatsPerMinute) * 60;
            var pixelsPerSecond = compositionLength / lengthOfCompositionInSeconds;
            var pixelsToAddEachInterval = pixelsPerSecond / 10;

            _currentRecordingInterval = window.setInterval(function () {
                var currentWidth = Number($(clip).css("width").replace("px", ""));
                $(clip).css("width", (currentWidth + pixelsToAddEachInterval) + "px");
            }, 100);

            $("#playButton").click();
        });
    }

    function bindStopButton() {
        $("body").on("click", "#stopButton", function (event) {
            $(".positionIndicator").css("transition", "");
            $(".positionIndicator").css("transform", "");
            if ( _currentRecordingInterval) {
                window.clearInterval(_currentRecordingInterval);
                _currentRecordingInterval = undefined;
            }
            if (_metronomeInterval) {
                window.clearInterval(_metronomeInterval);
                _metronomeInterval = undefined;
            }
            $(".clip").draggable({ axis: "x", snap: ".beatIndicator", containment: "parent", handle: ".draggableClipHandle" });
        });
    }

    return {
        init: init
    };
}());


$(document).ready(function () {
    jambo.init();
});
