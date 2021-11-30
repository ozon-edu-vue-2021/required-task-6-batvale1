<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
<!--    <common-components-view/>-->
    <functional-components-view/>
  </div>
</template>

<script>
// import CommonComponentsView from './components/views/CommonComponentsView';
import FunctionalComponentsView from './components/views/FunctionalComponentsView';

export default {
  name: 'App',
  components: {
    FunctionalComponentsView,
    // CommonComponentsView
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
