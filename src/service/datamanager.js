
import Vue from 'vue';
import VueResource from 'vue-resource';
Vue.use(VueResource);

var mainPath = 'http://localhost:3004/';
var $http = Vue.http;

var getSentiment = function (courseId, callback) {
    //var tmpURL = mainPath + 'getSentiment?courseId=' + courseId;
    var tmpURL = mainPath + 'sentiment?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getSentimentDetails = function (courseId, days, callback) {
    var tmpURL = mainPath + 'sentiment?courseId=' + courseId + '&days=' + days;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getWordCloudDataByUser = function (courseId, userId, callback) {
    //var tmpURL = mainPath + 'getWordCloudData?courseId=' + courseId + '&userId=' + userId;
    var tmpURL = mainPath + 'wordCloudData?type=user&courseId=' + courseId + '&userId=' + userId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getWordCloudDataByGeo = function (courseId, countryCode, callback) {
    var tmpURL = mainPath + 'getWordCloudData?type=geo&courseId=' + courseId + '&countryCode=' + countryCode;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getForumSocialNetwork = function (courseId, filterLevel, callback) {
    if (filterLevel === 0 || filterLevel) {
    } else {
        filterLevel = 0;
    }
    var tmpURL = mainPath + 'modules/vistoolkit/data/graph/' + courseId + '-' + filterLevel + ".json";
    $http.get(tmpURL)
        .then(function (response) {
            if (response.ok)
                callback(response);
        });
};

var getSeekInfo = function (courseId, videoId, paramters, callback) {
    var tmpURL = mainPath + 'contentBasedData?type=seek&courseId=' + courseId + '&videoId=' + videoId;
    if (typeof paramters === 'function') {
        callback = paramters;
    }else if (typeof paramters === 'object') {
        for (let p in paramters) {
            tmpURL += '&' + p + '=' + paramters[p];
        }
    }

    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getActionCountInfo = function (courseId, videoId, paramters, callback) {
    var tmpURL = mainPath + 'contentBasedData?type=action&courseId=' + courseId + '&videoId=' + videoId;
    if (typeof paramters === 'function') {
        callback = paramters;
    }else if (typeof paramters === 'object') {
        for (let p in paramters) {
            tmpURL += '&' + p + '=' + paramters[p];
        }
    }

    $http.get(tmpURL).then(function (response) {
        callback(response);
    });

};

var getDailyHotnessByVideo = function (courseId, videoId, callback) {
    var tmpURL = mainPath + 'videoPop?courseId=' + courseId + '&videoId=' + videoId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getDemographicData = function (courseId, callback) {
    var tmpURL = mainPath + 'demographicData?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getCourseInfo = function (courseId, callback) {
    var tmpURL = mainPath + 'courseInfo?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getCourseList = function (callback) {
    var tmpURL = mainPath + 'courseList';
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getHotness = function (courseId, callback) {
    var tmpURL = mainPath + 'hotness?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getVideoList = function (courseId, callback) {
    var tmpURL = mainPath + 'videoList?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        response.data.forEach(function (week) {
            week.videos.forEach(function (video) {
                if (!video.videoSource) {
                    video.videoSource = "";
                }
            })
        });
        callback(response);
    });
};

var getAnimationTest = function (courseId, videoId, startTime, endTime, callback) {
    var tmpURL = mainPath + 'animationtest?videoId=' + videoId + '&courseId=' + courseId + '&startTime=' + startTime + '&endTime=' + endTime;
    $http.get(tmpURL)
        .then(function (response) {
            callback(response);
        })
    ;
};

var getGlyphInfo = function (courseId, callback) {
    var tmpURL = mainPath + 'glyphInfo?courseId=' + courseId;
    $http.get(tmpURL)
        .then(function (response) {
            callback(response);
        });
};

var getParallelCoor = function (courseId, callback) {
    var tempURL = mainPath + 'parallelCoor?courseId=' + courseId;
    $http.get(tempURL)
        .then(function (response) {
            callback(response)
        })
    ;
};



// Public API
export default {
    'getParallelCoor': getParallelCoor,
    'getGlyphInfo': getGlyphInfo,
    'getAnimationTest': getAnimationTest,
    'getSentiment': getSentiment,
    'getWordCloudDataByUser': getWordCloudDataByUser,
    'getWordCloudDataByGeo': getWordCloudDataByGeo,
    'getSentimentDetails': getSentimentDetails,
    'getForumSocialNetwork': getForumSocialNetwork,
    'getActionCountInfo': getActionCountInfo,
    'getSeekInfo': getSeekInfo,
    'getDailyHotnessByVideo': getDailyHotnessByVideo,
    'getDemographicData': getDemographicData,
    'getCourseInfo': getCourseInfo,
    'getCourseList': getCourseList,
    'getHotness': getHotness,
    'getVideoList': getVideoList
};
