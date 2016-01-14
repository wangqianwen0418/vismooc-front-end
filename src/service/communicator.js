var SLIDECOMPONENT_MESSAGE = 'slideComponentChanged',
    SHOTIMG_MESSAGE = 'shotImgChanged',
    FLOWMAPSLIDE_MESSAGE = 'flowmapSlideChanged',
    SENTIMENT_MESSAGE = 'sentimentChanged',
    GRAPH_USERNAME_MESSAGE = 'graphUsernameChanged',
    CODE3_MESSAGE = 'code3Changed';

var CHANGE_COURSE = "changeCourse",
    CHANGE_VIDEO = "changeVideo",
    FILTER_COUNTRY = "filterCountry",
    FILTER_DATE = "filterDate",
    FILTER_FREQ = "filterFreq";

export default function (scope) {
    
    //sentiment analysis
    var emitSentiment = function (data) {
        scope.$root.$children[0].$broadcast(SENTIMENT_MESSAGE, data);
    };

    //click a user in social network
    var emitGraphUsername = function (data) {
        scope.$root.$children[0].$broadcast(GRAPH_USERNAME_MESSAGE, data);
    };

    var emitCode3 = function (data) {
        scope.$root.$children[0].$broadcast(CODE3_MESSAGE, data);
    };

    // change slide bar value in flowmap view
    var emitFlowmapSlideChange = function (data) {
        scope.$root.$children[0].$broadcast(FLOWMAPSLIDE_MESSAGE, data);
    };

    var emitShotImgChange = function (data) {
        scope.$root.$children[0].$broadcast(SHOTIMG_MESSAGE, data);
    };

    var emitSlideComponentChange = function (data) {
        scope.$root.$children[0].$broadcast(SLIDECOMPONENT_MESSAGE, data);
    };

    var emitFilterCountry = function (countryID) {
        scope.$root.$children[0].$broadcast(FILTER_COUNTRY, countryID);
    };

    var emitFilterDate = function (period) {
        scope.$root.$children[0].$broadcast(FILTER_DATE, period);
    };

    var onSentiment = function (handler) {
        scope.$on(SENTIMENT_MESSAGE, function (data) {
            handler.call(scope,data);
        });
    };

    var onGraphUsername = function (handler) {
        scope.$on(GRAPH_USERNAME_MESSAGE, function (data) {
            handler.call(scope,data);
        });
    };

    //click a country in the social network
    var onCode3 = function (handler) {
        scope.$on(CODE3_MESSAGE, function (data) {
            handler.call(scope,data);
        });
    };

    var onFlowmapSlideChange = function (handler) {
        scope.$on(FLOWMAPSLIDE_MESSAGE, function (data) {
            handler.call(scope,data);
        });
    };

    // ShotImg
    var onShotImgChange = function (handler) {
        scope.$on(SHOTIMG_MESSAGE, function (data) {
            handler.call(scope,data);
        });
    };

    // Slide Component include  preview & leftArrow & rightArrow
    var onSlideComponentChange = function (handler) {
        scope.$on(SLIDECOMPONENT_MESSAGE, function (data) {
            handler.call(scope,data);
        });
    };

    var emitChangeCourse = function (courseId) {
        scope.$root.$children[0].$broadcast(CHANGE_COURSE, courseId);
    };

    var onChangeCourse = function (handler) {
        scope.$on(CHANGE_COURSE, function (courseId) {
            handler.call(scope,courseId);
        });
    };

    var emitChangeVideo = function (video) {
        console.log("change video");
        scope.$root.$children[0].$broadcast(CHANGE_VIDEO, video);
    };

    var onChangeVideo = function (handler) {
        scope.$on(CHANGE_VIDEO, function (video) {
            handler.call(scope,video);
        });
    };

    var onFilterCountry = function (handler) {
        scope.$on(FILTER_COUNTRY, function (data) {
            handler.call(scope,data);
        });
    };

    var onFilterDate = function (handler) {
        scope.$on(FILTER_DATE, function (data) {
            handler.call(scope,data);
        });
    };

    return {
        'emitSlideComponentChange': emitSlideComponentChange,
        'onSlideComponentChange': onSlideComponentChange,
        'emitShotImgChange': emitShotImgChange,
        'onShotImgChange': onShotImgChange,
        'emitFlowmapSlideChange': emitFlowmapSlideChange,
        'onFlowmapSlideChange': onFlowmapSlideChange,
        'emitSentiment': emitSentiment,
        'onSentiment': onSentiment,
        'emitGraphUsername': emitGraphUsername,
        'onGraphUsername': onGraphUsername,
        'emitCode3': emitCode3,
        'onCode3': onCode3,
        'emitChangeCourse': emitChangeCourse,
        'onChangeCourse': onChangeCourse,
        'emitChangeVideo': emitChangeVideo,
        'onChangeVideo': onChangeVideo,
        'emitFilterCountry': emitFilterCountry,
        'onFilterCountry': onFilterCountry,
        'emitFilterDate': emitFilterDate,
        'onFilterDate': onFilterDate
    }
}
