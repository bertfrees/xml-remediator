import React from 'react';
import Remediation from './Remediation'

/* TODO and NOTES
it seems more appropriate to consider the whole remediation list as a kind of stack
of applicable corrections, with some correction depending on others
On remediation click (or on a button), 
    - Set content view focus on the corresponding file and elemment
*/

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
                <label>{this.props.remediation.pattern} : {this.props.remediation.actions} </label>
                <button disabled={this.props.isApplied}
                    onClick={(event:any) => {
                        if(!this.props.isApplied){
                            this.props.onApply();
                        }
                    }}>Apply</button>
            </div>;
    }
}
