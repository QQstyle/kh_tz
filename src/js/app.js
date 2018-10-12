import React, { Component } from "react";
import { render } from "react-dom";
import axios from "axios";
import SimpleStorage from "react-simple-storage";

import "../sass/style.sass";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cinemas: [],
      cities: [],
      search: '',
      city: '1',
      limit: '10',
      type: 'title'
    };
    this.onScroll = this.onScroll.bind(this);
  }
  componentWillMount() {
    const {city, limit} = this.state;
    window.addEventListener('scroll', this.onScroll);
    this.getCities();
    this.getCinimas(city, limit);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }
  

  getCities() {
    axios.get(`https://api.kinohod.ru/api/restful/v1/cities`).then(res => {
      const cities = res.data.data;
      this.setState({ cities });
    });
  }

  getCinimas(id, limit, type) {
    let city = id;
    let citiesLimit = limit;
    let sortType = type;
    axios
      .get(
        `https://api.kinohod.ru/api/restful/v1/cinemas?city=${city}&limit=${citiesLimit}&sort=${sortType}`
      )
      .then(res => {
        const cinemas = res.data.data;
        this.setState({ cinemas, city });
      });
  }

  updateSearch(e) {
    this.setState({search: e.target.value.substr(0,25).trim()});
  }
  

  handleClick(id) {
    const {limit, type} = this.state
    this.getCinimas(id, limit, type);
    this.setState({search: ''});
  }

  onSort(sort){
    const {city, limit, type} = this.state
    console.log(this.state.type, sort)
    this.setState((state) => {
      return {type: state.sort}
    });
    this.getCinimas(city, limit, type);
    console.log(this.state.type, sort)
  }

  onScroll(){
    let wrap = document.getElementById('cinemas_list');
    let contentHeight = wrap.offsetHeight;
    let yOffset = window.pageYOffset; 
    let y = yOffset + window.innerHeight;
    if(y >= contentHeight){
      const {city, limit, type} = this.state;
      this.getCinimas(city, limit+10, type);
    }
  }

  render() {
    const { cinemas, cities, search } = this.state;

    let filteredCities = cities.filter(city => {
      return city.attributes.name.toLowerCase().indexOf(search.toLowerCase()) !== -1;
      }
    );
    const citiesList = filteredCities.map(city => {
      if (search) {
        return(
          <div className="city_list-item" onClick={() => this.handleClick(city.id)} key={city.id}>{city.attributes.name}</div>
        )
      }
    })

    const cinemasList = cinemas.map(cinema => {
      return (
        <div className="cinemas_list-item" key={cinema.id}>
          <div className="cinemas_list-item-left">
            <h3 className="title">{cinema.attributes.shortTitle || cinema.attributes.title }</h3>
            <p className="adress">{cinema.attributes.mall || cinema.attributes.address}</p>
            <div className="subway_wrapper">
              {
                cinema.attributes.subway.map(sw => {
                  return(
                    <div className="subway" key={sw.id}>
                      <span className="subway_icon" style={{borderColor: `#${sw.color}`}}/>
                      <span className="subway_name">{sw.name}</span>
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className="cinemas_list-item-right">
          {
            cinema.attributes.labels.map((item, id) => {
            if(item.text) {
              return(<span className="tickets" key={id}>{item.text}</span>)
            }
           })
          }
            <button className="plus" />
          </div>
        </div>
      )
    });

    return (
      <div className="container">
        <SimpleStorage parent={this} />
        <div className="search">
          <input className="search_input" type="text" value={this.state.search} ref="search" onChange={this.updateSearch.bind(this)} placeholder="Введите название города"/>
          <button className="search_btn" onClick={() => this.onSort('title')}>sort by title</button>
          <button className="search_btn" onClick={() => this.onSort('distance')}>sort by range</button>
        </div>
        <div className="city">
          <div className="city_list">
            {citiesList}
          </div>
        </div>
        <div className="cinemas">
          <div className="cinemas_list" id="cinemas_list">{cinemasList}</div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("app"));
