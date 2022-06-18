/**
 * General JS package for Weaviate.io
 */

// Format numbers
function addCommas(nStr){
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

// function to get JSON
var getUrl = function(url, reqType, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = reqType;
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

// Highlight JS
hljs.registerLanguage('graphql', window.hljsDefineGraphQL);
hljs.highlightAll();

// Version check for documentation version picker
var versionPicker = document.getElementById('view_version');
if (versionPicker) {
    var currentVersion = window.location.pathname.split("/")[3];
    var currentDocs = window.location.pathname.split("/")[2];
    // set the correct version
    versionPicker.innerHTML = currentVersion;
    // // on change, go to the right version
    // versionPicker.addEventListener('change', function(){
    //     var newVersion = versionPicker.value;
    //     var newLocation = window.location.pathname.replace(currentVersion, newVersion);
    //     var request = new XMLHttpRequest();
    //     request.open('GET', newLocation, true);
    //     request.onreadystatechange = function () {
    //     if (request.readyState === 4) {
    //         if (request.status === 404) {
    //         window.location = '/developers/' + currentDocs + '/' + newVersion + '/';
    //         } else {
    //         window.location = newLocation;
    //         }
    //     }
    //     };
    //     request.send();
    // });
}

// Make headers in docs clickable
var currentElement, headerId;
if(window.location.pathname.includes('/developers/')){
    var headers = document.getElementsByTagName('h1');
    for(var i = 0; i < headers.length; i++) {
        if(typeof headers[i].id != 'undefined' && headers[i].id != ''){
            currentElement = document.getElementById(headers[i].id);
            currentElement.style.cursor = 'pointer';
            currentElement.onclick = function(){
                if(window.location.hash != '#' + this.id){
                    window.location.assign('#' + this.id);
                }
            };
        }
    }
}

// Scroll docs if header has a #
if(window.location.pathname.includes('/developers/')){
    var scrollHash = function(){
        window.scrollBy(0, -100);
    }
    window.onhashchange = function(){
        scrollHash();
    };
    if(window.location.hash) {
        scrollHash();
    }
}

// Add stars and downloads from API
var dockerPulls = document.getElementById('show_containers');
var githubStars = document.getElementById('show_github_stars');
if (dockerPulls && githubStars) {
    // get docker pulls
    getUrl('https://europe-west1-semi-production.cloudfunctions.net/docker-hub-pulls', 'text', 
        function(err, data) {
        if (err !== null) {
            dockerPulls.innerHTML = '🤷';
        } else {
            dockerPulls.innerHTML = data;
        }
    });
    // get github stars
    getUrl('https://api.github.com/repos/semi-technologies/weaviate', 'json', 
        function(err, data) {
        if (err !== null) {
            githubStars.innerHTML = '🤷';
        } else {
            githubStars.innerHTML = addCommas(data.stargazers_count);
        }
    });
}

// ToC links
var toc = document.getElementById('table-of-contents');
if (toc){
    toc = toc.getElementsByTagName('a');
    for (tocKey in toc){
        if(isNaN(tocKey) === false){
        toc[tocKey].classList.add('list-link');
        }
    }
}

// set total pulls
var totalpullsDiv = document.getElementById('totalpulls');
if(totalpullsDiv){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        if (totalpullsDiv) {
            totalpullsDiv.src =
            'https://img.shields.io/badge/downloads-' +
            req.responseText +
            '-yellow?style=flat-square';
        }
      }
    };
    req.open('GET', 'https://europe-west1-semi-production.cloudfunctions.net/docker-hub-pulls');
    req.send(null);
}

// set data on homepage
if(document.getElementById('homepage-stats-container')){
    // animation function
    function animateValue(obj, start, end, duration) {
        var startTimestamp = null;
        var step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
                var progress = Math.min((timestamp - startTimestamp) / duration, 1);
                obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString('en-US');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    // get stars
    getUrl('https://api.github.com/repos/semi-technologies/weaviate', 'text', function(status, data){
        var result = JSON.parse(data)['watchers'];
        animateValue(document.getElementById('data-stargazers'), 0, result, 1820);
    });
    // set downloads
    getUrl('https://europe-west1-semi-production.cloudfunctions.net/docker-hub-pulls', 'text', function(status, data){
        var result = data;
        console.log(parseInt(result.replace(',', '')));
        animateValue(document.getElementById('data-downloads'), 0, parseInt(result.replace(',', '')), 1820);
    });
    // get countries
    getUrl('https://us-central1-semi-production.cloudfunctions.net/website-visitors', 'text', function(status, data){
        var result = data;
        animateValue(document.getElementById('data-visitors'), 0, data, 1820);
    });
    // get Slack users
    var slackUsers = 854;
    animateValue(document.getElementById('data-slack'), 0, slackUsers, 1820);
}

// handle more info request
var requestMoreInfoBtn = document.getElementById('requestMoreInfo');
if(requestMoreInfoBtn){
    // validate the email
    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    // send the documents
    function requestDocs(emailAddress, downloadlinkid){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('GET', 'https://europe-west1-semi-production.cloudfunctions.net/sendgrid-request-slidedeck?email=' + emailAddress + '&downloadLinkId=' + downloadlinkid);
        xmlHttp.send(null);
        return xmlHttp.status;
    }
    requestMoreInfoBtn.onclick = function(){
        // e.preventDefault();
        var emailAddress = document.getElementById('requestMoreInfo-email').value;
        if(validateEmail(emailAddress) === true){
            requestDocs(emailAddress, requestMoreInfoBtn.dataset.downloadlinkid);
            document.getElementById('requestMoreInfo-box-success').style.display = 'block';
            document.getElementById('requestMoreInfo-box-invalid-email').style.display = 'none';
        } else {
            document.getElementById('requestMoreInfo-box-invalid-email').style.display = 'block';
        }
    };
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Set accordion
function set_accordion() {

    function close_or_open_accordion(language){
        var accordions = document.getElementsByClassName("accordion-button");
        for (var i = 0; i < accordions.length; i++) {
            var currentLanguage = accordions.item(i).dataset.language;
            if(currentLanguage == language && accordions.item(i).getAttribute("aria-expanded") == "false"){
                accordions.item(i).click();
            }
        }
    }

    var accordions = document.getElementsByClassName("accordion-button");
    for (var i = 0; i < accordions.length; i++) {
        var currentLanguage = accordions.item(i).dataset.language;
        if(currentLanguage != undefined){
            accordions.item(i).addEventListener("click", function(){
                close_or_open_accordion(this.dataset.language);
                setCookie("client-language", this.dataset.language, 128);
            });
        }
    }

    var clientLanguage = getCookie("client-language");
    if(clientLanguage != ""){
        close_or_open_accordion(clientLanguage);
    }
};

// follow the sidenav
var sidenavElem = document.getElementsByClassName('sidenav');
if (sidenavElem.length > 0) {
    // set location where ended
    var lastDocScroll = getCookie('docScroll');
    if(lastDocScroll !== ''){
        sidenavElem[0].scrollTop = lastDocScroll;
    }
    // store location of scroll in cookie
    sidenavElem[0].addEventListener('scroll', function(e) {
        setCookie('docScroll', sidenavElem[0].scrollTop, 0.0035);
    });
}

set_accordion();