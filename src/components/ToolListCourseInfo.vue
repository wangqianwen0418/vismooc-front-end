<template>
    <!--Modal-->
    <div id="course-info-modal" class="modal fade"  tabindex="-1" style = "min-width:40%"  role="dialog" aria-labelledby="course-info-modal-label" aria-hidden="true">
        <div class="modal-dialog"  role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"aria-label="Close" >&times;</button>
                    <h3 id="course-info-modal-label" class="modal-title">Course Information</h3>
                </div>
                <div class="modal-body">

                        <div style="width: 60%; float:left">
                            <h3>Course Name:</h3>
                            <strong>{{ courseInfo.courseName }}</strong>
                            <h3>Instructor(s):</h3>
                            <strong>{{ courseInfo.instructor }}</strong>
                        </div>
                        <div style="width: 30%; float:left; margin-top: 30px">
                            <img :src="courseInfo.img" style="width:150px" />
                        </div>
                    <div class="clearfix"></div>
                    <h3>Description:</h3>
                    <p>
                        {{courseInfo.description}}
                    </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    
    <!--Button-->
    <div v-show="courseId!=-1" class="statisitc-icon" data-toggle="modal" data-target="#course-info-modal">
            <span class="fa fa-info-circle"></span>
            <br/>Course Info
    </div>

</template>

<script>
    //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    
    export default {
        ready(){
            //select the modal then append it to the last of <body>
            $("#course-info-modal").appendTo("body");
            
            communicator(this).onChangeCourse((courseId)=>{
                if(courseId >= 0){
                    dataManager.getCourseInfo(courseId,(response)=>{
                        this.courseId = response.data.courseId;
                        this.courseInfo = response.data;
                    });
                }
            });
        },
        data(){
            return {
              courseId:-1,
              courseInfo:{courseName:"",instructor:"",description:"",img:""}  
            };
        }
    }
    
</script>


<style>
    
 
    
    
</style>