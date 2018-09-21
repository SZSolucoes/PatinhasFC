import React from 'react';
import { connect } from 'react-redux';

import {
  SCLAlert,
  SCLAlertButton
} from 'react-native-scl-alert';

import { store } from '../../App';

class AlertScl extends React.Component {

  render() {
    return (
        <SCLAlert
            theme={this.props.theme}
            show={this.props.showAlertScl}
            title={this.props.title}
            subtitle={this.props.subtitle}
            onRequestClose={() => store.dispatch({
                type: 'modifica_showalertscl_alertscl',
                payload: false
            })}
        >
            <SCLAlertButton 
                theme={this.props.theme} 
                onPress={() => store.dispatch({
                    type: 'modifica_showalertscl_alertscl',
                    payload: false
                })}
            >
                Ok
            </SCLAlertButton>
        </SCLAlert>  
    );
  }

}

const mapStateToProps = (state) => ({
    showAlertScl: state.AlertSclReducer.showAlertScl,
    theme: state.AlertSclReducer.theme,
    title: state.AlertSclReducer.title,
    subtitle: state.AlertSclReducer.subtitle,
});

export default connect(mapStateToProps)(AlertScl);

