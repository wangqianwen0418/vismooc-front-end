import Vue from 'vue';
import VueResource from 'vue-resource';
//CSS
import 'bootstrap-webpack';
import 'font-awesome-webpack';

//components here
import App from './components/App.vue';
Vue.use(VueResource);

new Vue({
    el:'body',
    components:{
       App
    }
});