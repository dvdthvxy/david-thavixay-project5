import React, { Component } from 'react';
import SearchBar from './SearchBar.js'
import SearchResults from './SearchResults.js';
import PlayerStats from './PlayerStats.js';
import axios from 'axios';
import cryingjordan from './assets/images/cryingjordan.png';
import noPicture from './assets/images/noPicture.png';
import './App.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      userInput: '',
      year: [],
      yearSelected: '',
      searchResults: [],
      player: [],
      stats: [],
      team: '',
      picUrl: '',

      searchResultSection: false,
      playerStatSheetSection: false,
      noResultsSection: false,
      picLoaded: false,
      hasPic: false,
      hasStats: false
    }
  }

  handleChange = (event) => {
    this.setState({
      userInput: event.currentTarget.value
    })
  }

  selectedYear = (event) => {
    this.setState({
      yearSelected: event.currentTarget.value
    })
  }

  onKeyDown = (event) => {
    if (event.keyCode === 32) {
      this.getPlayer(event)
    }
  }

  getPlayer = (event) => {
    const results = this.state.searchResults
    results.forEach((player) => {
      if (event.currentTarget.value === player.id) {
        this.setState({
          player: player,
          team: player.team.abbreviation,
          searchResultSection: false,
          playerStatSheetSection: true
        })
      }
    })

    axios({
      url: 'https://www.balldontlie.io/api/v1/season_averages',
      method: 'GET',
      dataResponse: 'JSON',
      params: {
        season: this.state.yearSelected,
        'player_ids[]': event.currentTarget.value
      }
    }).then((response) => {
      const data = response.data.data[0];
      if (data !== undefined) {
        const convertToArray = Object.keys(data).map(function (key) {
          return [key, data[key]]
        })
        this.setState({
          stats: convertToArray,
          hasStats: true
        })
      }
      else {
        this.setState({
          hasStats: false
        })
      }
      this.getPlayerPic()
    })
  }

  search = () => {
    const query = this.state.userInput;
    this.setState({
      searchResults: [],
      player: [],
      stats: [],
      team: '',
      picUrl: '',
      picLoaded: false,

      searchResultSection: false,
      playerStatSheetSection: false,
      noResultsSection: false,
      hasPic: false,
      hasStats: false
    })
    if (query !== '') {
      axios({
        url: 'https://www.balldontlie.io/api/v1/players',
        method: 'GET',
        dataResponse: 'JSON',
        params: {
          search: query
        }
      }).then((response) => {
        const data = response.data.data;
        if (data.length === 1) {
          this.setState({
            player: data[0],
            team: data[0].team.abbreviation
          })
          axios({
            url: 'https://www.balldontlie.io/api/v1/season_averages',
            method: 'GET',
            dataResponse: 'JSON',
            params: {
              season: this.state.yearSelected,
              'player_ids[]': this.state.player.id
            }
          }).then((response) => {
            const data = response.data.data[0];
            if (data !== undefined) {
              const convertToArray = Object.keys(data).map(function (key) {
                return [key, data[key]]
              })
              this.setState({
                stats: convertToArray,
                searchResults: data,
                playerStatSheetSection: true,
                noResultsSection: false,
                searchResultSection: false,
                hasStats: true

              })

            } else {
              this.setState({
                playerStatSheetSection: true,
                hasStats: false
              })
            }
            this.getPlayerPic()
          })
        } else if (data.length > 0) {
          this.setState({
            searchResults: data,
            playerStatSheetSection: false,
            noResultsSection: false,
            searchResultSection: true
          })
        } else {
          this.setState({
            playerStatSheetSection: false,
            noResultsSection: true,
            searchResultSection: false
          })
        }
      })
    } else {
      alert('Please enter a name')
    }
  }

  getPlayerPic = () => {
    axios({
      url: 'https://nba-players.herokuapp.com/players/' + this.state.player.last_name + '/' + this.state.player.first_name,
      method: 'GET',
      dataResponse: 'JSON',
    }).then((response) => {
      const data = response.data
      if (data === 'Sorry, that player was not found. Please check the spelling.') {
        this.setState({
          picLoaded: true,
          hasPic: false
        })
      } else {
        const finalUrl = 'https://nba-players.herokuapp.com/players/' + this.state.player.last_name + '/' + this.state.player.first_name
        this.setState({
          picLoaded: true,
          hasPic: true,
          picUrl: finalUrl
        })
      }
    })
  }

  displayPic = () => {
    if (this.state.hasPic) {
      return <img src={this.state.picUrl} alt={`Headshot of ${this.state.player.first_name} ${this.state.player.last_name}`} tabIndex='6'/>
    }
    else {
      return <img src={noPicture} alt={`Headshot of ${this.state.player.first_name} ${this.state.player.last_name}`} tabIndex='6'/>
    }
  }

  getYears() {
    const date = new Date();
    const maxYear = date.getFullYear();
    const minYear = 1998;
    const years = [];

    for (let i = minYear; i < maxYear; i++) {
      years.push(i)
    }

    const yearsReversed = years.reverse()

    this.setState({
      year: yearsReversed,
      yearSelected: yearsReversed[0]
    })
  }

  componentDidMount() {
    this.getYears()
  }

  render() {
    return (
      <div className='App' aria-live='polite'>
        <div className="searchBarSection">
          <SearchBar onClick={this.search} onChange={this.handleChange} year={this.state.year} selectedYear={this.selectedYear} />
        </div>
        {this.state.searchResultSection ?
          <div className='searchResults'>
            <ul className='searchList'>
              {this.state.searchResults.map((player, i) => {
                return <SearchResults key={i} value={player.id} firstName={player.first_name} lastName={player.last_name} onClick={this.getPlayer} onKeyDown={this.onKeyDown}/>
              })}
            </ul>
          </div>
          : null}
        {this.state.noResultsSection ?
          <div className="noResults">
            <p>No Results</p>
          </div>
          : null}
        {this.state.playerStatSheetSection ?
          <div className={`teamLogo ${this.state.team.length > 0 ? this.state.team : ''}`}>
            <div className="player">
              <div className='playerPic'>
                {this.state.picLoaded ?
                  this.displayPic()
                  : <img className="App-logo" src={cryingjordan} alt="Preloader" />}
              </div>
              <div className="playerStatSheet">
                <p className='playerName' tabIndex='7'>{this.state.player.first_name} {this.state.player.last_name}</p>

                {this.state.hasStats ?
                  <ul className='stats'>
                    {this.state.stats.map((stat, i) => {
                      return <PlayerStats key={i} statName={stat[0]} statNumber={stat[1]} />
                    })}
                  </ul>
                  : <div className="noStats">
                    <p>This player has no stats for this year.</p>
                  </div>}
              </div>
            </div>
          </div>
          : null}
      </div>
    )
  }
}

export default App;
