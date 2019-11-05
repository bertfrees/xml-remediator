import React from 'react';
import './App.css';

import { FileInput } from './components/FileInput';
import { ContentView } from './components/ContentView';


// react-toastify for notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/mode/xml';
import 'brace/mode/html';
import 'brace/mode/css';
import 'brace/mode/text';
import 'brace/mode/plain_text';

import 'brace/theme/github';
import 'brace/theme/monokai';

import Remediation from './components/RemediationType';
import RemediationView from './components/RemediationView';

/**
 * Hash of available ace modes per extension
 */
const ace_mode_for_extension: { [key: string]: string } = {
    "xhtml": "xml",
    "xml": "xml",
    "ncx": "xml",
    "opf": "xml",
    "html": "html",
    "htm": "html",
    "css": "css",
    "txt": "plain_text"
};

/**
 * Retrieve the Ace mode from file extension.
 * If no mode is avaible, the plain_text mode is used
 * @param {string} filepath path or name of the file to visualise with ace
 */
function getMode(filepath: string) {
    let temp = filepath.split('.');
    if (temp.length > 1) {
        let mode = ace_mode_for_extension[temp.pop()!];
        return mode !== undefined ? mode : ace_mode_for_extension["txt"];
    } else {
        return ace_mode_for_extension["txt"];
    }
}


/**
 * Hash of the used mimetype per extension
 */
const mimetypeMap: { [key: string]: string } = {
    "png": "image/png",
    "jpe": "image/jpeg",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "xhtml": "application/xhtml+xml",
    "xml": "text/xml",
    "html" : "text/html",
    "txt":"text/plain"
};
function getMimetypeAs<T>(filepath:string):T{
    let temp = filepath.split('.');
    if (temp.length > 1) {
        let mimetype = mimetypeMap[temp.pop()!];
        return mimetype !== undefined ? mimetype as unknown as T : mimetypeMap["txt"] as unknown as T;
    } else {
        return mimetypeMap["txt"] as unknown as T;
    }
}


class App extends React.Component {

    state = {
        raw_mode: false,
        input_viewer_css: ["App-input-viewer", "show"],
        drawer_button_css: ["App-button"],
        output_viewer_css: ["App-output-viewer", "with-drawer"],
        remediations_css:["App-remediation"],
        editor_width: "auto",
        input_file: "",
        input_content: "",
        output_content: "",
        applicable_remediations: new Array<Remediation>(),
        applied_remediations_stack: new Array<Remediation>()
    };

    fileInput: any;
    rawEditor: any;
    epubViewer: any;

    constructor(props: any) {
        super(props);
        this.epubViewer = React.createRef();
        this.fileInput = React.createRef();
        this.rawEditor = React.createRef();

        this.handleFileSubmit.bind(this);
    }

    changeEditorView() {
        var newstate = this.state;
        if (newstate.raw_mode === true) {
            newstate.raw_mode = false;
        } else newstate.raw_mode = true;
        this.setState(newstate);
    };

    loadingToastId: React.ReactText = "";
    /**
     * Actions done when a file is uploaded : 
     * @param  {[type]} event:any [description]
     * @return {[type]}           [description]
     */
    handleFileSubmit(event: any) {
        event.preventDefault();
        if (this.fileInput.current.files.length > 0) {
            for (var i = this.fileInput.current.files.length - 1; i >= 0; i--) {
                let fileObject = this.fileInput.current.files[i];
                let reader = new FileReader();
                reader.readAsText(fileObject,"UTF-8");
                reader.onload = (event:any)=>{
                    let content = event.target.result;
                    // Compute remediation
                    // Example remediation found in a sample : replace p with class "CN" by <h1>
                    let remediations = this.state.applicable_remediations;
                    remediations.push({
                        pattern:"//p[contains(@class,'CN')]",
                        remapping:"h1"
                    });
                    
                    // original content
                    this.setState({
                        applicable_remediations:remediations,
                        input_content:event.target.result,
                        output_content:content
                    });
                };
                this.setState({
                    input_file:fileObject.name
                });
            }
        } else {
            alert("No file selected");
        }
    }

    /**
     * 
     */
    undoLastRemediation(){
        let stack = this.state.applied_remediations_stack;
        stack.pop();
        this.onRemediationsStackUpdate(stack);
    }

    /**
     * Apply a remediation
     */
    onRemediationApplied(remediation:Remediation){
        // push remediation on application stack
        let stack = this.state.applied_remediations_stack;
        stack.push(remediation);
        this.onRemediationsStackUpdate(stack);
    }

    /**
     * general function call to update the result and the remediation stack
     */
    onRemediationsStackUpdate(new_remediation_stack:Array<Remediation>){
        let currentContent = this.state.input_content;
        if(this.state.input_file){
           let mimetype = getMimetypeAs<SupportedType>(this.state.input_content);
            new_remediation_stack.forEach(remediation => {
                // apply remediation on content
                let document = new window.DOMParser().parseFromString(this.state.input_content, mimetype);
                console.log(document);
            });
        }
        
        // update stack and content output content
        this.setState({
            applied_remediations_stack:new_remediation_stack,
            output_content:currentContent
        });
    }


    /**
     * Application structure
     *  given an input document (for now xhtml)
     *  - display the original document on the right
     *  - display the remediation list on the center
     *    - for each remediation
     *      - if remediation is a structural proposal, use a checkbox like validation
     *      - if remediation is missing content warning, use a text-area validation 
     *  - display the remediation result on the right
     *    - result displayed is recomputed 
     * 
     * display can be done with 2 mode : 
     * - Raw mode based on Ace editor
     * - html preview mode computed by xslt transform
     */
    render() {
        var switchingView: String =
            this.state.raw_mode === true ?
                "Switch to text viewer" :
                "Switch to raw viewer";
        let input_viewer;
        let remediations_viewer;
        let displayedFileName = "";
        if (this.state.raw_mode === true) {
            let fileExtension = displayedFileName.substring(displayedFileName.lastIndexOf('.') + 1);
            /*
            input_viewer =
                <AceEditor
                    width="auto"
                    mode={getMode(this.state.input_file)}
                    defaultValue="Please upload an xhtml file to start"
                    value={this.state.input_content}
                    theme="monokai"
                    name="input_viewer"
                    editorProps={{ $blockScrolling: true }}
                />; */
            remediations_viewer =
                <AceEditor
                    width="auto"
                    mode={getMode(this.state.input_file)}
                    defaultValue="Please upload an xhtml file to start"
                    value={this.state.output_content}
                    theme="monokai"
                    name="output_viewer"
                    editorProps={{ $blockScrolling: true }}
                />;

        } else {
            // TODO could be cool to sync scrolling between the 2 viewer
            /*input_viewer = <ContentView 
                    content={this.state.input_content} 
                    mimetype="application/xhtml+xml"
                />; */
            remediations_viewer = <ContentView
                    content={this.state.output_content}
                    mimetype="application/xhtml+xml"
                    allowEdition={true}
                />;
        }
        // For each posible remediation
        let remediationsViews = new Array<JSX.Element>();
        this.state.applicable_remediations.forEach( remediation =>{
            var isApplied = false;
            // check if the current remediation is in
            var len = this.state.applied_remediations_stack.length;
            while(!isApplied && len--){
                isApplied = this.state.applied_remediations_stack[len].pattern === remediation.pattern ?
                    true :
                    false;
            }
            remediationsViews.push(
                <RemediationView 
                    key={"remediation-"+remediationsViews.length}
                    remediation={remediation}
                    isApplied={isApplied}
                    onApply={() => {
                        this.onRemediationApplied(remediation);
                    }} />
            );
        });
        let canUndo:boolean = this.state.applied_remediations_stack.length > 0;
        return (
            <div className="App">
                <ToastContainer />
                <header className="App-header">

                    <FileInput className="App-button"
                        mimetype={getMimetypeAs<string>("expect.xhtml")}
                        label="Input document : "
                        onFileSubmit={(event: any) => { 
                            this.handleFileSubmit(event) 
                        }}
                        eventRef={this.fileInput} />
                    
                    <button className="App-button"
                        onClick={(event: any) => {
                            this.changeEditorView();
                        }} >{switchingView}</button>
                    
                </header>
                <main className="App-frame">
                    <div className="App-remediation">
                        <p className="App-subframe-title">Possible remediations</p>
                        <button disabled={!canUndo}
                        onClick={(event: any) => {
                            this.undoLastRemediation();
                        }} >Undo</button>
                        {remediationsViews}
                        
                    </div>
                    <div className={this.state.output_viewer_css.join(' ')}>
                        <p className="App-subframe-title">Remediations preview</p>
                        {remediations_viewer}
                    </div>
                    
                </main>
                <footer className="App-footer" />
            </div>
        );
    }
}

export default App;


/* code backup

    showDrawer() {
        let newstate = this.state;
        if (newstate.input_viewer_css.length <= 1) {
            newstate.drawer_button_css.push("rotate");
            newstate.input_viewer_css.push("show");
            newstate.output_viewer_css.push("with-drawer");
        }
        this.setState(newstate);
    }

    hideDrawer() {
        let newstate = this.state;
        if (newstate.input_viewer_css.length > 1) {
            newstate.input_viewer_css.pop();
            newstate.drawer_button_css.pop();
            newstate.output_viewer_css.pop();
        }
        this.setState(newstate);
    }


drawer button
<button className={this.state.drawer_button_css.join(" ")}
                        onClick={(event: any) => {
                            this.state.input_viewer_css.length > 1 ?
                                this.hideDrawer() :
                                this.showDrawer();
                        }} >&#9776;</button>

input viewer 
<div className={this.state.input_viewer_css.join(' ')}>
                        <p className="App-subframe-title">Original content</p>
                        {input_viewer}
                    </div> */