import React from 'react';

const base64abc = (() => {
    let abc = [],
        A = "A".charCodeAt(0),
        a = "a".charCodeAt(0),
        n = "0".charCodeAt(0);
    for (let i = 0; i < 26; ++i) {
        abc.push(String.fromCharCode(A + i));
    }
    for (let i = 0; i < 26; ++i) {
        abc.push(String.fromCharCode(a + i));
    }
    for (let i = 0; i < 10; ++i) {
        abc.push(String.fromCharCode(n + i));
    }
    abc.push("+");
    abc.push("/");
    return abc;
})();

function uint8ArrayToBase64(bytes:Uint8Array){
    let result = '', i, l = bytes.length;
    for (i = 2; i < l; i += 3) {
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
        result += base64abc[bytes[i] & 0x3F];
    }
    if (i === l + 1) { // 1 octet missing
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[(bytes[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) { // 2 octets missing
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[(bytes[i - 1] & 0x0F) << 2];
        result += "=";
    }
    return result;
}

interface ContentViewProps {
    content:string,
    mimetype:string,
    allowEdition:boolean
}

export class ContentView extends React.Component<ContentViewProps,{}> {
    static defaultProps:ContentViewProps = {
        content:"",
        mimetype:"text/plain",
        allowEdition:false
    }
    
    constructor(props:ContentViewProps){
        super(props);
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
            return <iframe src={
                    "data:" + this.props.mimetype + ";base64, " + 
                    uint8ArrayToBase64(new TextEncoder().encode(contentToRender))} 
                    height="100%" width="100%"
                    contentEditable={true}
                ></iframe>;
        } else return <p>Please load a document to start.</p>
        
    }
}