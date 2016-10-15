import Vue from 'vue';
import VueResource from 'vue-resource';
Vue.use(VueResource);

let mainPath = 'http://vis.cse.ust.hk/vismooc/';
let $http = Vue.http;

// We need
let getActionCountInfo = function (courseId, videoId, paramters, callback) {
    let tmpURL = mainPath + 'getContentBasedData?type=action&courseId=' + courseId + '&videoId=' + videoId;
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

let getSeekInfo = function (courseId, videoId, paramters, callback) {
    let tmpURL = mainPath + 'getContentBasedData?type=seek&courseId=' + courseId + '&videoId=' + videoId;
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

let getCourseList = function (callback) {
    let tmpURL = mainPath + 'getCourseList';
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

let getVideoList = function (courseId, callback) {
    let tmpURL = mainPath + 'getVideoList?courseId=' + courseId;
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

let getCourseInfo = function (courseId, callback) {
    let tmpURL = mainPath + 'getCourseInfo?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

let getHotness = function (courseId, callback) {
    let tmpURL = mainPath + 'getHotness?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

let getDemographicData = function (courseId, callback) {
    let tmpURL = mainPath + 'getDemographicData?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};
let getDailyHotnessByVideo = function (courseId, videoId, callback) {
    let tmpURL = mainPath + 'getVideoPop?courseId=' + courseId + '&videoId=' + videoId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

// no need currently
let getSentiment = function (courseId, callback) {
    let tmpURL = mainPath + 'getSentiment?courseId=' + courseId;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

let getWordCloudData = function (courseId, userId, callback) {
    let tmpURL = mainPath + 'getWordCloudData?courseId=' + courseId + '&userId=' + userId;

    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

let getWordCloudDataByGeo = function (courseId, code3, callback) {
    let tmpURL = mainPath + 'getWordCloudDataByGeo?courseId=' + courseId + '&countryCode=' + code3;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

let getSentimentDetails = function (courseId, days, callback) {
    let tmpURL = mainPath + 'getSentimentDetails?courseId=' + courseId + '&days=' + days;
    $http.get(tmpURL).then(function (response) {
        callback(response);
    });
};

let getForumSocialNetwork = function (courseId, filterLevel, callback) {
    if (filterLevel === 0 || filterLevel) {
    } else {
        filterLevel = 0;
    }
    let tmpURL = mainPath + 'data/forumSocialNetwork/' + courseId + '-' + filterLevel + ".json";
    $http.get(tmpURL)
        .then(function (response) {
            if (response.ok)
                callback(response);
        });
};

let getAnimationTest = function (courseId, videoId, startTime, endTime, callback) {
    let tmpURL = mainPath + 'animationtest?videoId=' + videoId + '&courseId=' + courseId + '&startTime=' + startTime + '&endTime=' + endTime;
    $http.get(tmpURL)
        .then(function (response) {
            callback(response);
        })
    ;
};

let getGlyphInfo = function (courseId, callback) {
    let tmpURL = mainPath + 'getGlyphInfo?courseId=' + courseId;
    $http.get(tmpURL)
        .then(function (response) {
            callback(response);
        });
};

let getParallelCoor = function (courseId, callback) {
    let tempURL = mainPath + 'ParallelCoor?courseId=' + courseId;
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