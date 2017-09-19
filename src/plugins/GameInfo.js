import * as React from 'react';
import autobind from 'auto-bind';

import {
  Row,
  Col,

  Button,

  CardBlock,

  Form,
  FormGroup,

  Label,

  InputGroup,
  InputGroupButton,
  Input
} from 'reactstrap';

import {
  Toolbox,
  towercgConnect
} from '@towercg/dashboard';


export class GameInfo extends React.Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = {
      status: '',
      game: '',

      statusSubmittable: false
    };
  }

  componentWillMount() {
    const {towercg, channelInfo} = this.props;

    towercg.eventBus.on('twitch.statusChanged', this._onStatusChanged);
    towercg.eventBus.on('twitch.gameChanged', this._onGameChanged);

    this.setState({ game: channelInfo.game, status: channelInfo.status });
  }

  componentWillUnmount() {
    const {towercg} = this.props;

    towercg.eventBus.removeListener('twitch.statusChanged', this._onStatusChanged);
    towercg.eventBus.removeListener('twitch.gameChanged', this._onGameChanged);
  }

  _onGameChanged({oldGame, newGame}) {
    if (oldGame !== newGame) {
      this.setState({ game: newGame });
    }
  }

  _onStatusChanged({oldStatus, newStatus}) {
    if (oldStatus !== newStatus) {
      this.setState({ status: newStatus });
    }
  }

  _formInputChange(ev) {
    const {channelInfo} = this.props;

    this.setState({ [ev.target.name]: ev.target.value });
    this.setState({ statusSubmittable: this.state.status !== channelInfo.status });
  }

  async _changeStatus() {
    const {towercg} = this.props;
    const {channelInfo} = this.props;

    await towercg.invoke("twitch.updateChannel", {
      channel: `#${channelInfo.name}`,
      options: {
        status: this.state.status
      }
    });
  }

  render() {
    const {channelInfo} = this.props;

    return (
      <Toolbox.DashboardPluginBody
        key="twitch.game-info"
        title={`#${channelInfo.name}`}
        xs={12} sm={12} md={6}
      >
        <CardBlock>
          <Row>
            <Col sm={3}>Current Status</Col>
            <Col sm={9}>
              {channelInfo.status}
            </Col>
          </Row>
          <Row>
            <Col sm={3}>Current Game</Col>
            <Col sm={9}>
              {channelInfo.game}
            </Col>
          </Row>
        </CardBlock>
        <CardBlock>
          <Row>
            <Col sm={12}>
              <InputGroup>
                <Input type="text"
                       name="status"
                       placeholder="Twitch Status/Channel Title"
                       value={this.state.status}
                       onChange={this._formInputChange} />
                <InputGroupButton color="primary"
                                  disabled={!this.state.statusSubmittable}
                                  onClick={this._changeStatus}>
                  {this.state.statusSubmittable ? "Change" : "No Change"}
                </InputGroupButton>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <p>TODO: game search + game select</p>
            </Col>
          </Row>
        </CardBlock>
      </Toolbox.DashboardPluginBody>
    );
  }
}

const wrapped = towercgConnect(GameInfo, (state, ownProps) => ({
  channelInfo: state.twitch.channels[ownProps.pluginConfig.channel]
}));
export default wrapped;
