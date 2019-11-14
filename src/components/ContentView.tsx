import React from 'react';

import Base64 from './Base64';

/* TODO : 
- Replace iframe content view by html integration in react
    - when viewing each text block, display the node stack on the left
- For nodes and remediation, 
    - add a "depency" arg that states what node or what remediation is required
- Create buttons and/or actions for the following nodes :
    - <p> with a class : allow to rename one or all corresponding node with heading, and to keep class or not
    - <span> with class : allow to rename, allow to add a "xml:lang"
    - <img> : allow to edit the alt, allow to wrap in a figure
    - <figcaption> : allow to edit content
*/


interface ContentViewProps {
    content:string,
    mimetype:string,
    allowEdition:boolean
}

export default class ContentView extends React.Component<ContentViewProps,{}> {
    static defaultProps:ContentViewProps = {
        content:"",
        mimetype:"text/plain",
        allowEdition:false
    }
    
    render(){
        if(this.props.content !== ""){
            let contentToRender = this.props.content;
            // test to allow content edition
            //if(this.props.allowEdition){
            //    contentToRender = contentToRender.replace(/<p /g,"<p contentEditable=\"true\" ");
            //    
            //    console.log(contentToRender);
            //}
            return (
                <iframe 
                    title="html_view"
                    src={ "data:" + this.props.mimetype + ";base64, " + Base64.encodeString(contentToRender)} 
                    height="100%" width="100%"
                    contentEditable={true}
                ></iframe>
            );
        } else return <p>Please load a document to start.</p>
        
    }
}