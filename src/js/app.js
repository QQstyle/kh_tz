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
      search: "",
      city: "1",
      limit: 10,
      range: "0",
      type: "title",
      latitude: "",
      longitude: "",
      isVisible: false,
      permission: false
    };
  }
  componentWillMount() {
    const { city, range, limit } = this.state;
    window.addEventListener("scroll", this.onScroll);
    this.getCities();
    this.getCinemas(city, range, limit);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScroll);
  }

  getCities = () => {
    axios.get(`https://api.kinohod.ru/api/restful/v1/cities`).then(res => {
      const cities = res.data.data;
      this.setState({ cities });
    });
  };

  getCinemas = (id, range, limit, type, lat, long) => {
    let city = id;
    range = this.state.range;
    axios
      .get(
        `https://api.kinohod.ru/api/restful/v1/cinemas?city=${id}&rangeStart=${range}&limit=${limit}&sort=${type}&latitude=${lat}&longitude=${long}`
      )
      .then(res => {
        const cinemas = res.data.data;
        this.setState({ cinemas, range, limit, city, type, latitude: lat, longitude: long });
        console.log(this.state)
      });
      
  };

  updateSearch = e => {
    this.setState({ search: e.target.value.substr(0, 25).trim() });
  };

  handleClick = id => {
    const { limit, type } = this.state;
    this.getCinemas(id, limit, type);
    this.setState({ search: "" });
  };

  handleModalClick = type => {
    const { permission } = this.state;
    if (!permission && type === "distance") {
      this.modalOpen(true);
    } else if (permission && type === "distance") {
      this.sortDistance();
    }
    this.sortTitle(type);
  };

  checkLocation = () => {
    const { city, range, limit } = this.state;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.getCinemas(
          city,
          range,
          limit,
          "distance",
          position.coords.latitude,
          position.coords.longitude
        );
        this.setState({latitude: position.coords.latitude, longitude: position.coords.longitude})
      });
    }
    
  };

  sortTitle = sort => {
    const { city, limit } = this.state;
    this.getCinemas(city, limit, sort);
  };

  sortDistance = () => {
    this.checkLocation();
    this.modalOpen(false);
    this.setState({ permission: true });
  };

  modalOpen = bool => {
    this.setState({ isVisible: bool });
  };

  onScroll = () => {
    let wrap = document.getElementById("cinemas_list");
    let contentHeight = wrap.offsetHeight;
    let yOffset = window.pageYOffset;
    let y = yOffset + window.innerHeight;
    if (y >= contentHeight) {
      const { city, range, limit, type, longitude, latitude} = this.state;
      let nexLimit = limit+10;
      this.getCinemas(city, range, nexLimit, type, longitude, latitude);
    }
  };

  render() {
    const { cinemas, cities, search } = this.state;

    let filteredCities = cities.filter(city => {
      return (
        city.attributes.name.toLowerCase().indexOf(search.toLowerCase()) !== -1
      );
    });
    const citiesList = filteredCities.map(city => {
      if (search) {
        return (
          <div
            className="city_list-item"
            onClick={() => this.handleClick(city.id)}
            key={city.id}
          >
            {city.attributes.name}
          </div>
        );
      }
    });

    const cinemasList = cinemas.map(cinema => {
      return (
        <div className="cinemas_list-item" key={cinema.id}>
          <div className="cinemas_list-item-left">
            <h3 className="title">
              {cinema.attributes.shortTitle || cinema.attributes.title}
            </h3>
            <p className="adress">
              {cinema.attributes.mall || cinema.attributes.address}
            </p>
            <div className="subway_wrapper">
              {cinema.attributes.subway.map(sw => {
                return (
                  <div className="subway" key={sw.id}>
                    <span
                      className="subway_icon"
                      style={{ borderColor: `#${sw.color}` }}
                    />
                    <span className="subway_name">{sw.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="cinemas_list-item-right">
            {cinema.attributes.labels.map((item, id) => {
              if (item.text) {
                return (
                  <span className="tickets" key={id}>
                    {item.text}
                  </span>
                );
              }
            })}
            <button className="plus" />
          </div>
        </div>
      );
    });
    let modalClass = "modal";
    if (this.state.isVisible) {
      modalClass += " modal-show";
    }
    return (
      <div className="container">
        <SimpleStorage parent={this} />
        <div className="search">
          <input
            className="search_input"
            type="text"
            value={this.state.search}
            ref="search"
            onChange={this.updateSearch}
            placeholder="Введите название города"
          />
          <button
            className="search_btn"
            onClick={() => this.handleModalClick("title")}
          >
            sort by title
          </button>
          <button
            className="search_btn"
            onClick={() => this.handleModalClick("distance")}
          >
            sort by range
          </button>
        </div>
        <div className="city">
          <div className="city_list">{citiesList}</div>
        </div>
        <div className="cinemas">
          <div className="cinemas_list" id="cinemas_list">
            {cinemasList}
          </div>
        </div>
        <div className={modalClass}>
          <div className="modal_content">
            <p>
              Для того чтобы показать ближайшие к Вам кинотеатры, нам необходимо
              знать где Вы находитесь. Для этого нам нужно разрешение на
              определение Вашего местоположения
            </p>
            <div className="modal_content-wrapper">
              <button
                className="modal_content-btn btn-left"
                onClick={() => this.modalOpen(false)}
              >
                Отмена
              </button>
              <button
                className="modal_content-btn btn-right"
                onClick={this.sortDistance}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("app"));
