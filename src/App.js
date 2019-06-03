import React, { Component } from 'react';
import SearchBar from './SearchBar.js'
import SearchResults from './SearchResults.js';
import PlayerStats from './PlayerStats.js';
import cryingjordan from './assets/images/cryingjordan.png';
import noPicture from './assets/images/noPicture.png';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      userInput: '', //user's text input
      year: [], //array of years from the current to 1998
      yearSelected: '', //user's selected year
      searchResults: [], //array of search results
      player: [], //array of single player's data
      stats: [], //array of single player's stats
      team: '', //the player's team
      picUrl: '', //picture URL of the player's headshot

      searchResultSection: false, //state of search result section
      playerStatSheetSection: false, //state of player's stat sheet
      noResultsSection: false, //state of no results
      picLoaded: false, //state if picture has been loaded
      hasPic: false, //state if player has a headshot
      hasStats: false //state if player has any stats for the year
    }
  }

  // event handler for textbox
  handleChange = (event) => {
    this.setState({
      userInput: event.currentTarget.value //assign value of textbox to userInput
    })
  }

  // event handler for year dropdown menu
  selectedYear = (event) => {
    this.setState({
      yearSelected: event.currentTarget.value //assign year value to yearSelected
    })
  }

  // event handler for results page. For accessibility. Allows user to press SPACEBAR to select player name
  onKeyDown = (event) => {
    if (event.keyCode === 32) {
      this.getPlayer(event)
    }
  }

  //gets specific player info
  getPlayer = (event) => {
    const results = this.state.searchResults //store search results into another array for manipulation
    results.forEach((player) => { //iterate through all players in the search results
      if (event.currentTarget.value === player.id) { //check if the player ID matches the one the user selected
        this.setState({
          player: player, //assign player information
          team: player.team.abbreviation, //assign player's team
          searchResultSection: false, //turn off search results section
          playerStatSheetSection: true //turn on player stat sheet
        })
      }
    })

    //api call for specific player data
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
      //if data is returned assign their stats to an array
      if (data !== undefined) {
        //data is given as an object. Funciton collects the key and value then assigns them as pairs in an array
        //This is done because the key represents the name of the stat and we need the name later on
        const convertToArray = Object.keys(data).map(function (key) {
          return [key, data[key]]
        })
        this.setState({
          stats: convertToArray, //assign stats to an array
          hasStats: true
        })
      }
      //if no data is returned, hasStats set to false
      else {
        this.setState({
          hasStats: false
        })
      }
      this.getPlayerPic()
    })
  }

  //get a list of players based on user's search criteria
  search = () => {
    const query = this.state.userInput; //assigning user's input
    this.setState({ //reseting all the states
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

    //checks if user has inputed anthing. Input cannot be blank
    if (query !== '') {
      //api call to get list of players
      axios({
        url: 'https://www.balldontlie.io/api/v1/players',
        method: 'GET',
        dataResponse: 'JSON',
        params: {
          search: query
        }
      }).then((response) => {
        const data = response.data.data;
        //if only one player is return, immediately display their stats
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
          //if more than one player is returned, display search results
        } else if (data.length > 1) {
          this.setState({
            searchResults: data,
            playerStatSheetSection: false,
            noResultsSection: false,
            searchResultSection: true
          })
          //if no player is returned, display no results section
        } else {
          this.setState({
            playerStatSheetSection: false,
            noResultsSection: true,
            searchResultSection: false
          })
        }
      })
      //if user tries to submit empty textbox, alert user to input something
    } else {
      alert('Please enter a name')
    }
  }

  //get player's headshot
  getPlayerPic = () => {
    //api call to get player headshot
    axios({
      url: 'https://nba-players.herokuapp.com/players/' + this.state.player.last_name + '/' + this.state.player.first_name,
      method: 'GET',
      dataResponse: 'JSON',
    }).then((response) => {
      const data = response.data
      //if api returns no headshot, hasPic set to false
      if (data === 'Sorry, that player was not found. Please check the spelling.') {
        this.setState({
          picLoaded: true,
          hasPic: false
        })
        //if api returns a headshot, assign its url to picUrl
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

  //display headshot of player
  displayPic = () => {
    //if the player has a headshot, display their headshot
    if (this.state.hasPic) {
      return <img src={this.state.picUrl} alt={`Headshot of ${this.state.player.first_name} ${this.state.player.last_name}`} tabIndex='6'/>
    }
    //if the player does not have a picture, display default headshot
    else {
      return <img src={noPicture} alt={`Headshot of ${this.state.player.first_name} ${this.state.player.last_name}`} tabIndex='6'/>
    }
  }

  //generate year dropdown values
  getYears() {
    const date = new Date(); //get current date
    const maxYear = date.getFullYear(); //get current year
    const minYear = 1998; //min year is 1998 because the API data only goes that far
    const years = [];

    //create an array of minimum year to max year
    for (let i = minYear; i < maxYear; i++) {
      years.push(i)
    }

    const yearsReversed = years.reverse()

    this.setState({
      year: yearsReversed,
      yearSelected: yearsReversed[0] //set user's default year value
    })
  }

  componentDidMount() {
    this.getYears() //invoke getYears
  }

  render() {
    return (
      <div className='App' aria-live='polite'>
        {/* Search Bar Section */}
        <div className="searchBarSection">
          <SearchBar onClick={this.search} onChange={this.handleChange} year={this.state.year} selectedYear={this.selectedYear} />
        </div>
        {/* Search Results Section */}
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
          {/* Player Stat Sheet Section */}
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
