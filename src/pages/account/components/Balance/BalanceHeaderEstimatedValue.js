import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HighlightTextSpan, RegularTextSpan } from "styles/Styles";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons/faCircleNotch";
import I from "components/I";
import React from "react";
import styled, { withTheme } from "styled-components";

const Card = styled.div`
  padding: 0px;
  min-height: 128px;
  background: ${(props) => props.theme.foreground};
  border: none;
  text-align: center;
`;

const TitleDiv = styled.div`
  padding: 20px 20px 0px 20px;
  user-select: none;
`;

const ContentDiv = styled.div`
  padding: 0px 20px 20px;
  color: ${(props) => props.theme.textWhite};
`;

class BalanceHeaderEstimatedValue extends React.PureComponent {
  render() {
    return (
      <div>
        <div className="h4 text-uppercase text-center text-white mb-2" style={{letterSpacing: "0"}}>
        <I s={this.props.title} />
        </div>
        <div className="row no-gutters align-items-center justify-content-center">
          <div className="col-auto">
            <div className="h2 mb-0 text-white">$</div>
          </div>
          <div className="col-auto">
            <div className="display-1 mb-0 text-white">
            {this.props.isLoading ? (
              <FontAwesomeIcon
                style={{
                  display: "inline-block",
                  margin: "24px",
                  width: "14px",
                  height: "14px",
                }}
                color={this.props.theme.textDim}
                icon={faCircleNotch}
                spin={true}
              />
            ) : (
              <div>
                {this.props.estimatedValue}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default withTheme(
  connect(null, mapDispatchToProps)(BalanceHeaderEstimatedValue)
);
