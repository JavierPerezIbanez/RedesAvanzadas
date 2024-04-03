<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->



<!-- PROJECT LOGO -->
<br />
<div align="center">

<h3 align="center">MiddlewareForMQTT</h3>

  <p align="center">
    HTTP to MQTT Middleware
    <br />
  </p>
</div>



<!-- Incio -->
## Needed

For this server to run you should have installed in your machine <b><i>node.js</i></b>, if not you should install it.

### NPM Installations

You will need a few dependencies to install in the root of this project
* npm
  ```sh
  npm install express
  npm install mqtt
  ```

### Basics

The objective of this middleware is to act as a translator for the http petitions that arrive and translate them
to a MQQT petition, it is the first instance of this code, you should run the other middleware.
<br><br>
You should make some changes to connect it correctly to MQTT, but it should work without a problem if you run it with  
the load-balancer that comes in this git repository 