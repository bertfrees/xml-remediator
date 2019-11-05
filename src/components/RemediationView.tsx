import React from 'react';

import Remediation from './RemediationType'

interface RemediationViewProps {
    remediation:Remediation,
    onApply:Function,
    isApplied:boolean
}


export default class RemediationView extends React.Component<RemediationViewProps,{}> {

    static defaultProps = {
        onApply:()=>{},
        isApplied:false,
        remediation:{}
    }


    render(){
        
        return <div>
                <label>Remap {this.props.remediation.remapping} </label>
                <button disabled={this.props.isApplied}
                    onClick={(event:any) => {
                        if(!this.props.isApplied){
                            this.props.onApply();
                        }
                    }}>Apply</button>
            </div>;
    }
}
