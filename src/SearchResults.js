import React, { Component } from 'react';

class SearchResults extends Component {

    //displays search results
    render() {
        return (
            <li onClick={this.props.onClick} onKeyDown={this.props.onKeyDown} value={this.props.value} key={this.props.value} tabIndex='5'>
                <p >{this.props.firstName} {this.props.lastName}</p>
            </li>
        )
    }
}

export default SearchResults;