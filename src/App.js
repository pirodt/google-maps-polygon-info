import React, { Component } from 'react';
import {Map, Marker, GoogleApiWrapper, Polyline, Polygon} from 'google-maps-react';
import customData from './failedAddresses2.json';
import CsvDownload from 'react-json-to-csv'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      polygon: [],
      zone: [],
      addresses: [],
      finishedPolygon: false,
      geocodeInterval: ''
    };
    this.zoneArray = [];
    this.failedAddresses = [];
  }

  onMapClicked = (mapProps, map, clickEvent) => {
    if (this.state.finishedPolygon === false) {
      this.setState(prevState => (
        {
          polygon: [...prevState.polygon, {lat:clickEvent.latLng.lat(), lng:clickEvent.latLng.lng()}]
        }
      ));
    }

  }

  onMarkerClick = (props, marker, e) =>{
    if (this.state.finishedPolygon === false) {
      this.setState(prevState => (
        {
          polygon: [...prevState.polygon, {lat:e.latLng.lat(), lng:e.latLng.lng()}],
          finishedPolygon: true,
        }
      ));
    }
  }

  geoCodeInterval = () => {
    if(customData.length > 0) {
      var location = customData.pop();
      var address = location.suburb + ", " + location.city + ", " + location.state;
      this.state.geocoder.geocode({'address': address }, (results, status) => {
        var direccion = {};
        if (status === 'OK') {
          if (this.state.google.maps.geometry.poly.containsLocation(results[0].geometry.location, this.state.polygonArea) === true) {
            direccion =  {
              "codigo_postal": location["postal-code"],
              "colonia": location.suburb,
              "municipio": location.city,
              "zona": "Zona 2",
              "lat": results[0].geometry.location.lat(),
              "lng": results[0].geometry.location.lng(),
            };
          } else {
            direccion =  {
              "codigo_postal": location["postal-code"],
              "colonia": location.suburb,
              "municipio": location.city,
              "zona": "Zona 3",
              "lat": results[0].geometry.location.lat(),
              "lng": results[0].geometry.location.lng(),
            };
          }
          this.zoneArray.push(direccion);
          console.log(customData.length);
        } else {
          direccion =  {
            "postal-code": location["postal-code"],
            "suburb": location.suburb,
            "city": location.city,
            "state": location.state
          };
          this.failedAddresses.push(direccion);
          console.log(this.failedAddresses.length);
          console.log('Geocode was not successful for the following reason: ' + status);
        }
      });
    } else {
      console.log('ya?');
      clearInterval(this.state.geoCodeInterval);
      var json1 = "data:'"+"text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.zoneArray))+ "'";
      var json2 = "data:'"+"text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.failedAddresses))+ "'";
      this.setState({
        addresses: this.zoneArray,
        json1: json1,
        json2: json2
      })
      localStorage.setItem('addresses', JSON.stringify(this.zoneArray));
    }
  }

  onPolygonClick = (props, polygon, e) => {
    var geocoder = new props.google.maps.Geocoder();
    this.setState({
      polygonArea: polygon,
      geocoder: geocoder,
      google: props.google
    });

    this.setState({
      geoCodeInterval: setInterval(this.geoCodeInterval, 1000)
    });
  }

  clearPolygon = () => {
    this.setState({
      polygon: [],
      finishedPolygon: false
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Map
            google={this.props.google}
            ref={(ref) => { this.map = ref; }}
            onClick={this.onMapClicked}
            initialCenter={{lat:25.685208, lng:-100.317846}}>
            <Polyline
              path={this.state.polygon}
              strokeColor="#0000FF"
              strokeOpacity={0.8}
              strokeWeight={2} />
              {
                this.state.polygon.map((marker)=> {
                  return (<Marker onClick={this.onMarkerClick}
                    position={{lat: marker.lat, lng: marker.lng}} />)
                })
              }
              <Polygon
                onClick={this.onPolygonClick}
                visible={this.state.finishedPolygon}
                paths={this.state.polygon}
                strokeColor="#0000FF"
                strokeOpacity={0.8}
                strokeWeight={2}
                fillColor="#0000FF"
                fillOpacity={0.35} />
          </Map>
          <a style={{position: 'absolute', backgroundColor:'grey', padding:'5px', marginLeft:'100px'}} href={this.state.json1} download='addressesZone.json'>Click to download addresses</a>
          <a style={{position: 'absolute', backgroundColor:'grey', padding:'5px', marginLeft:'300px'}} href={this.state.json2} download='failedAddresses.json'>Click to download failed ddresses</a>
          <CsvDownload data={this.state.addresses} style={{position:'absolute'}}/>
        </header>
      </div>
    );
  }
}
export default GoogleApiWrapper({
  apiKey: ("AIzaSyAOj0_u0DRE2dK8X9YptdCXtxt89UCqfoo")
})(App)
