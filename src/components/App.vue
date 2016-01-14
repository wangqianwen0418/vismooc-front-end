<template>

<header  class="navbar navbar-fixed-top navbar-inverse">
    <div class="headContainer">
	<div class="navbar-header">
		<a class="navbar-brand" style="font-size: 24px; color: white; cursor: pointer;">VisMooc</a>
	</div>

	<div class="navbar-header" style="float: right">
		<a class="navbar-brand" style="font-size: 22px; color: #DEDEDE; cursor: pointer;">About Us</a>
		<a class="navbar-brand" style="font-size: 22px; color: #DEDEDE; cursor: pointer;">Help</a>
	</div>
</div>
</header>

    <div class="container-fluid">
    
    <div class="row">
        <div class="col-xs-3 col-sm-3 col-md-3 col-lg-3 sidebar">

            <side-bar></side-bar>
        </div>

        <div class="col-sm-8 col-sm-offset-3 col-md-8 col-md-offset-3 col-lg-8 col-lg-offset-3 content">
            <content></content>
        </div>

        <div class="col-sm-1 col-sm-offset-11 col-md-1 col-md-offset-11 sidebar vistoolkit">

            <tool-list></tool-list>
        </div>
    </div>
    </div>
    
</template>

<script>


//Component
import SideBar from './SideBar.vue';
import Content from './Content.vue';
import ToolList from './ToolList.vue';

export default{
    components:{
        SideBar,
        Content,
        ToolList
    }
}

</script>

<<style>
body {
	background: white !important;
	padding-top: 50px;
}

.content {
	margin-top: 50px;
}

.headContainer {
	margin-left: 1%;
	margin-right: 1%;
}

.sidebar {
  display: none;
}

@media (min-width: 768px) {
.sidebar {
    position: fixed;
    top: 50px;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: block;
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto;         /* Scrollable contents if viewport is shorter than content. */
    background-color: #f5f5f5;
    border-right: 1px solid #eee;
  }
}

.undecorated-link:hover {
	text-decoration: none;
}

</style>