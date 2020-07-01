import { connect } from "react-redux";
import { showReceiveNewModal } from "redux/actions/ModalManager";
import AppLayout from "AppLayout";
import I from "components/I";
import React from "react";

import styled, { withTheme } from "styled-components";

import { MyModal, Section, TextPopupTitle } from "modals/styles/Styles";

const QrcodeTextDiv = styled.div`
  padding-top: 22px;
  text-align: center;
  color: ${(props) => props.theme.dark};
`;

const QrcodeDiv = styled.div`
  padding: 24px;
  width: auto;
  margin: 24px auto;
  background: #ffffff;
`;

class ReceiveNewModal extends React.Component {
  onClose = () => {
    this.props.closeModal();
  };

  render() {
    return (
      <MyModal
        centered
        width="100%"
        footer={null}
        closable={false}
        maskClosable={true}
        visible={this.props.isVislble}
        onCancel={() => this.onClose()}
        bodyStyle={{
          padding: "0"
        }}
      >

        <Section>
        <div className="modal-dialog modal-dialog-vertical" role="document">
          <div className="modal-content">
            <div className="modal-body p-lg-0">
              <div className="d-inline-block w-lg-60 vh-100">
                <button className="btn btn-link text-dark position-absolute mt-n4 ml-n4 ml-lg-0 mt-lg-0" type="button" name="button" data-dismiss="modal" aria-label="Close" onClick={() => this.onClose()}>
                  <i className="fe fe-arrow-left h2"></i>
                </button>
                <div className="row justify-content-center">
                  <div className="col col-lg-8">
                    <h1 className="display-4 text-center my-5">
                      Receive money
                    </h1>

                  <div className="card mb-5">
                    <div className="card-body">
                      <QrcodeTextDiv>
                        <I s="Scan the QR code" />
                      </QrcodeTextDiv>
                      <QrcodeDiv>
                        <img 
                          style={{
                            width: "150px",
                            display: "block",
                            margin: "0 auto",
                          }}
                          src={require("./wechat_qrcode.jpg")}
                          alt="QR code"
                          draggable="false"
                        />
                      </QrcodeDiv>
                      </div>
                    </div>
                    <div className="d-block d-lg-none">
                      <h5 className="header-pretitle mb-4">Everyday benefits</h5>
                      <div className="row mb-4">
                        <div className="col-auto">

                          <div className="btn btn-rounded-circle badge-soft-primary">
                            ⚔️
                          </div>

                        </div>
                        <div className="col ml-n2">
                          <h2 className="card-title mb-2">
                            Secure
                          </h2>

                          <p className="card-text mb-1">
                            Like on Ethereum, enjoy 100% non-custodial transactions.
                          </p>

                        </div>
                      </div>
                      <div className="row mb-4">
                        <div className="col-auto">

                          <div className="btn btn-rounded-circle badge-soft-primary">
                            ⚡️
                          </div>

                        </div>
                        <div className="col ml-n2">
                          <h2 className="card-title mb-2">
                            Fast
                          </h2>

                          <p className="card-text mb-1">
                            No more waiting, your transactions are lightning fast.
                          </p>

                        </div>
                      </div>
                      <div className="row mb-6">
                        <div className="col-auto">

                          <div className="btn btn-rounded-circle badge-soft-primary">
                            💰
                          </div>

                        </div>
                        <div className="col ml-n2">
                          <h2 className="card-title mb-2">
                            Free
                          </h2>

                          <p className="card-text mb-1">
                            A transaction on Loopring Pay is completly free and doesn't require to pay gas fees.
                          </p>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-lg-inline-block w-lg-40 position-fixed d-none bg-primary">
                <div className="vh-100 p-4">
                  <div className="row justify-content-center">
                    <div className="col-10">
                      <img className="img-fluid mb-4" src="assets/images/logo.svg" alt="" width="64"/>
                      <h5 className="header-pretitle text-white mb-4">Everyday benefits</h5>
                      <div className="row mb-4">
                        <div className="col-auto">

                          <div className="btn btn-rounded-circle badge-soft-primary">
                            ⚔️
                          </div>

                        </div>
                        <div className="col ml-n2">
                          <h2 className="card-title mb-2 text-white">
                            Secure
                          </h2>

                          <p className="card-text text-white mb-1">
                            Like on Ethereum, enjoy 100% non-custodial transactions.
                          </p>

                        </div>
                      </div>
                      <div className="row mb-4">
                        <div className="col-auto">

                          <div className="btn btn-rounded-circle badge-soft-primary">
                            ⚡️
                          </div>

                        </div>
                        <div className="col ml-n2">
                          <h2 className="card-title mb-2 text-white">
                            Fast
                          </h2>

                          <p className="card-text text-white mb-1">
                            No more waiting, your transactions are lightning fast.
                          </p>

                        </div>
                      </div>
                      <div className="row mb-4">
                        <div className="col-auto">

                          <div className="btn btn-rounded-circle badge-soft-primary">
                            💰
                          </div>

                        </div>
                        <div className="col ml-n2">
                          <h2 className="card-title mb-2 text-white">
                            Free
                          </h2>

                          <p className="card-text text-white mb-1">
                            A transaction on Loopring Pay is completly free and doesn't require to pay gas fees.
                          </p>

                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div> 
          </div>
        </div>
        </Section>
      </MyModal>
      
    );
  }
}

const mapStateToProps = (state) => {
  const { modalManager } = state;
  const isVislble = modalManager.isReceiveNewModalVisible;
  return { isVislble };
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: () => dispatch(showReceiveNewModal(false)),
  };
};

export default withTheme(
  connect(mapStateToProps, mapDispatchToProps)(ReceiveNewModal)
);
