import React, { Component } from 'react';
import LocationPicker from 'react-location-picker';
import Slider from 'material-ui/Slider';
 
/* Default position */
const defaultPosition = {
  lat: 40.522529,
  lng: -74.457966
};

export const LocationPickerExample = ({onChange}) => (
  <LocationPickerExtended onChange={onChange}/>
)

class LocationPickerExtended extends Component {
  constructor (props) {
    super(props);

    this.state = {
      address: "Busch Student Center, Picataway, NJ 08854",
      position: {},
      defaultPosition: defaultPosition,
      radius: 50
    };

    // Bind
    this.handleLocationChange = this.handleLocationChange.bind(this);
  }

  handleLocationChange ({ position, address }) {

    // Set new location
    this.setState({ position, address });

    this.props.onChange(this.props.id, this.state.position, this.state.radius);
  }

  changeRadius = (e, newVal) => { this.setState({ 'radius': newVal }); 
  this.props.onChange(this.props.id, this.state.position,this.state.radius);}

  componentDidMount () {
    navigator && navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      this.setState({
        defaultPosition: {
          lat: latitude,
          lng: longitude
        }
      });
    });
    this.props.onChange(this.props.id,this.state.defaultPosition,this.state.radius);
  }

  render () {
    return (
      <div>
        <p style={{"marginBottom":"0px"}}>Range: {this.state.radius}m within: {this.state.address}</p>
        <div>
        <Slider defaultValue={50} max={250} min={10} onChange={this.changeRadius}
        sliderStyle={{"marginBottom": "9px", "marginTop":"9px"}}></Slider>
          <LocationPicker
            style={{"marginTop":"0px"}}
            containerElement={ <div style={ {height: '100%'} } /> }
            mapElement={ <div style={ {height: '400px'} } /> }
            defaultPosition={this.state.defaultPosition}
            radius={this.state.radius}
            zoom={17}
            onChange={this.handleLocationChange}
          />
        </div>
      </div>
    )
  }
}