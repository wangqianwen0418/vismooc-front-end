
import Vue from 'vue';
import VueResource from 'vue-resource';
Vue.use(VueResource);

var mainPath = 'http://localhost:3004/';
var $http = Vue.http;

var getSentiment = function (courseId, callback) {
    var tmpURL = mainPath + 'getSentiment?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getWordCloudData = function (courseId, userId, callback) {
    var tmpURL = mainPath + 'getWordCloudData?courseId=' + courseId + '&userId=' + userId;

    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getWordCloudDataByGeo = function (courseId, code3, callback) {
    var tmpURL = mainPath + 'getWordCloudDataByGeo?courseId=' + courseId + '&countryCode=' + code3;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getSentimentDetails = function (courseId, days, callback) {
    var tmpURL = mainPath + 'getSentimentDetails?courseId=' + courseId + '&days=' + days;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getForumSocialNetwork = function (courseId, filterLevel, callback) {
    if (filterLevel === 0 || filterLevel) {
    } else {
        filterLevel = 0;
    }
    var tmpURL = mainPath + 'modules/vistoolkit/response/graph/' + courseId + '-' + filterLevel + ".json";
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};



var getSeekInfo = function (courseId, videoId, paramters ,callback) {
    var tmpURL = mainPath + 'getContentBasedData?type=seek&courseId=' + courseId + '&videoId=' + videoId;
    for(let p in paramters){
          tmpURL += '&'+ p + '='+paramters[p];
     }
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getActionCountInfo = function(courseId,videoId, paramters,callback){
     var tmpURL = mainPath + 'getContentBasedData?type=action&courseId=' + courseId + '&videoId=' + videoId;
     for(let p in paramters){
          tmpURL += '&'+ p + '='+paramters[p];
     }
     $http.get(tmpURL).then(function (response) {
        callback(response);
    });
    
}



var getDailyHotnessByVideo = function (courseId, videoId, callback) {
    var tmpURL = mainPath + 'getVideoPop?courseId=' + courseId + '&videoId=' + videoId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getDemographicData = function (courseId, callback) {
    var tmpURL = mainPath + 'getDemographicData?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getCourseInfo = function (courseId, callback) {
    var tmpURL = mainPath + 'getCourseInfo?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getCourseList = function (callback) {
    var tmpURL = mainPath + 'getCourseList';
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getHotness = function (courseId, callback) {
    var tmpURL = mainPath + 'getHotness?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

var getVideoList = function (courseId, callback) {
    var tmpURL = mainPath + 'getVideoList?courseId=' + courseId;
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

// Public API
export default {
    'getSentiment': getSentiment,
    'getWordCloudData': getWordCloudData,
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