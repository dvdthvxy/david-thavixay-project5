import React, { Component } from 'react';
// import App from './App.js'

class SearchBar extends Component {
    render() {
        return (
            <div className='searchBar'>
                <h1 tabIndex='1'>NBA Season Stats</h1>
                <input type='text' onChange={this.props.onChange} placeholder='Enter a Player&apos;s Name ex: Kawhi Leonard' tabIndex='2'/>
                <div className='criteria'>
                    <div className='season'>
                        <label htmlFor='year'>Season:  </label>
                        <select id='year' name='year' onClick={this.props.selectedYear} tabIndex='3'>
                            {this.props.year.map((year, i) => {
                                return <option key={i} value={year}>{year}</option>
                            })}
                        </select>
                    </div>
                    <button onClick={this.props.onClick} tabIndex='4'>Search</button>
                </div>
            </div>
        )
    }
}

export default SearchBar;