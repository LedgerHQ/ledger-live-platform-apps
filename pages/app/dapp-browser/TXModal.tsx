import React from "react";
import Modal from "react-modal";
import styled from "styled-components";

type TXModalProps = {
    onResult: (result: boolean) => void,
    TXData?: any,
}

const Button = styled.button`
  
`

export const TXModal = ({ onResult, TXData }: TXModalProps) => {
    const style = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
        } as React.CSSProperties,
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: "translate(-50%, -50%)",
            background: 'black',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px',
            color: "white",
            height: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
        } as React.CSSProperties
    }

    const data = TXData ? TXData.params[0] : undefined;
    return (
        <Modal
            isOpen={!!TXData}
            onRequestClose={() => onResult(false)}
            contentLabel="TXModal"
            style={style}
            ariaHideApp={false}
        >
            {
                data ? (
                    <div>
                        <div>
                            {`From: ${data.from}`}
                        </div>
                        <div>
                            {`To: ${data.to}`}
                        </div>
                        <div>
                            {`Value: ${data.to}`}
                        </div>
                        <div>
                            <Button onClick={() => onResult(true)}>
                                accept
                            </Button>
                            <Button onClick={() => onResult(false)}>
                                decline
                            </Button>
                        </div>
                    </div>
                ) : null
            }
        </Modal>
    )
}