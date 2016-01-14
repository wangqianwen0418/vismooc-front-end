<template>
    <div id="videolist">
        <h4>Course Name</h4>
        <div class="input-group">
            <select class="form-control" v-model="selectedCourseId">
                <option v-for="course in courseList" :value="course.courseId" track-by="courseId">
                    {{course.courseName }}
                </option>
            </select>
        </div>
        <hr/>
        <div id="{{'v_group'+$index}}" class="panel panel-default panel-group"  v-for="videoGroup in videoList">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordionTwo" href="#collapse{{videoGroup.week}}">Week {{videoGroup.week}}</a>
                </h4>
            </div>
            <div class="panel-collapse collapse in" id="collapse{{videoGroup.week}}">
                <div class="list-group" v-for="video in videoGroup.videos">
                    <a :class="{'active':selectedVideoId === video.videoId}" @click="selectVideo(video)" class="list-group-item" style="cursor:pointer;">{{video.title}}</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    //service
    import dataManager from '../service/datamanager.js';
    import session from '../service/session.js';
    import communicator from '../service/communicator.js';
    
export default{
    ready() {
        //Get the course list when component is ready
        dataManager.getCourseList((response)=>{
            this.courseList = {};
            response.data.forEach((d) => {
                this.courseList[d.courseId] = d;
            });
        });
        
        //set the event listener
        communicator(this).onChangeVideo((video)=>{
            if (this.selectedVideoId === video.videoId) return;
                this.selectedVideoId = video.videoId;
                $('#videolist').scrollTop(0);
                $('#videolist').scrollTop($(this.hashVideo[video.videoId]).position().top - 50);
        });

    },
    data() {
        return {

            selectedCourseId: "",
            /*
            course:{
                _id:string,
                courseId:number|string,
                courseName:string,
                instructor:string,
                url:string,img:string,
                description:string 
            }
            */
            courseList: {},
            selectedVideoId: -1,
            /*
            videoGroup:[{
                week:number|string,
                videos:[
                    {
                        id:string,
                        courseId:string,
                        date:number|string,
                        pop:number|string,
                        title:string,
                        videoId:string,
                        videoLength:string|number,
                        videoSource:string,
                        week:string|number
                    }
                ]
            }]
             */
            videoList: [],
            hashVideo:{}
        };
    },
    methods: {
        selectVideo(video) {
            if(this.selectedVideoId === video.videoId) return;
            
            this.selectedVideoId = video.videoId;
            video.currentTime = 0;
            session.set('selectedVideo',video);
            communicator(this).emitChangeVideo(video);
        },
    },
    watch: {
        
        selectedCourseId(newValue, oldValue) {
            
            if (newValue === oldValue || !newValue) return;
            //Set the session of selectedCourseId
            session.set('selectedCourse',this.courseList[this.selectedCourseId]);
            
            //Get the video list when switch to different course
            dataManager.getVideoList(this.selectedCourseId,(response)=>{
                this.videoList = response.data;
                var hashVideo = {};
                this.videoList.forEach((group, group_index)=> {
                    group.videos.forEach((video, video_index)=> {
                        hashVideo[video.videoId] = '#v_group' + group_index;
                    });
                });
                this.hashVideo = hashVideo;
            });
            
            //emit signal
            communicator(this).emitChangeCourse(this.selectedCourseId);
        }
    }
}

</script>