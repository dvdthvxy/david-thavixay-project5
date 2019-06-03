import React, { Component } from 'react';

class PlayerStats extends Component {

displayStat = () => {
    
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