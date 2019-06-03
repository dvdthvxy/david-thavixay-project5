import React, { Component } from 'react';

class PlayerStats extends Component {

displayStat = () => {
    
    //checks the stat name. If it is the player's ID, do not display
    if (this.props.statName !== 'player_id') {
        const rawStatName = this.props.statName
        const statName = rawStatName.replace(/_/g, ' ')
        return (
            <li className='stat' tabIndex='8'>
                {statName}: {this.props.statNumber}
            </li>
        )
    } else {
        return <li></li>
    }
}

    render() {
        return (
            this.displayStat()
        )
    }
}

export default PlayerStats;