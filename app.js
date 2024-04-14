
const userLatitude = document.querySelector(".userLatitude");
const userLongitude = document.querySelector(".userLongitude");

const remoteLatitude = document.querySelector(".remoteLatitude");
const remoteLongitude = document.querySelector(".remoteLongitude");

const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");

const range = document.querySelector(".range");

const distance = document.querySelector(".distance");
let perm;
let accepting;

let rLat;
let rLong;
let uLat;
let uLong;
let trackerRange;

async function access(){
    perm = 'denied' 
    accepting = false;  
    trackerRange=100; 
    rLat=0;
    rLong=0;
    uLat=0;
    uLong=0;                                          //access permission for notification and location
    distance.innerHTML=0
    perm = await Notification.requestPermission();
    if(navigator.geolocation && perm=='granted')
    navigator.geolocation.getCurrentPosition(function(position){
        console.log("WORKING");
    })}


startButton.onclick=function(){
    startButton.style.background="green"     
    accepting=true;
    startAccepting();
}
stopButton.onclick=function(){
    startButton.style.background="blue"
    accepting=false;
}

const startAccepting = ()=>{
   
    if(accepting)        
    {
        setTimeout(()=>{
            navigator.geolocation.getCurrentPosition((position)=>{
                uLat=position.coords.latitude;
                uLong=position.coords.longitude;
                document.querySelector(".userLatitude").innerHTML = "Latitude: " + position.coords.latitude;
                document.querySelector(".userLongitude").innerHTML ="Longitude: " + position.coords.longitude;
            });
            remoteLocation();
            startAccepting();
        },15000)
    }
}

const remoteLocation = async ()=>{

    let res = await axios.get("https://api.thingspeak.com/channels/2503674/feeds.json?api_key=I60SPISIK730U0GM&results=1");
    console.log(res);
    rLat=res.data.feeds[0].field1;
    rLong=res.data.feeds[0].field2;
    document.querySelector(".remoteLatitude").innerHTML = "Latitude: " + rLat;
    document.querySelector(".remoteLongitude").innerHTML ="Longitude: " + rLong;
    let dist=getDistanceFromLatLonInKm(uLat,uLong,rLat,rLong);
    distance.innerHTML=dist.toFixed(3);
    if(range.value=="")
    console.log("no input")
    else{
          let difference = dist - range.value;
          if(difference>0)
          alert("TRACKER OUT OF RANGE")
          else
          console.log(`in range ${dist} ${range.value}`)
        }
    initMap();
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d*1000;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }


  
  // Initialize and add the map
let map;

async function initMap() {
  // The location of Uluru
  const position1 = { lat: uLat, lng: uLong };
  const position2= {lat: parseFloat(rLat), lng: parseFloat(rLong)};
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");


  map = new Map(document.getElementById("map"), {
    zoom: 10,
    center: position1,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at Uluru
  new google.maps.Marker({
    position: position1,
    map,
    title: "User",
  });
  new google.maps.Marker({
    position: position2,
    map,
    title: "Tracker",
  });
}

