import React from 'react';



interface FileInputCallback {
    (event:any): void
}

interface FileInputProps {
    onFileSubmit:FileInputCallback,
    mimetype:string,
    className:string,
    label:string,
    eventRef:React.RefObject<HTMLInputElement>
}
/**
 * @property onFileSubmit:FileInputCallback 
 */
export class FileInput extends React.Component<FileInputProps, {}> {


  static defaultProps:FileInputProps = {
        onFileSubmit:(event:any)=>{},
        mimetype:"",
        className:"",
        label: "Load file :",
        eventRef:React.createRef()
    }

    formRef:any;
    constructor(props:any) {
      super(props);
      this.formRef = React.createRef();
    }

  render() {
    return (
      <form className={this.props.className} onSubmit={this.props.onFileSubmit} ref={this.formRef}>
        <label className={this.props.className}>{this.props.label}</label>
        <input type="file" ref={this.props.eventRef} accept={this.props.mimetype}/>
        <button type="submit">Load</button>
      </form>
    );
  }
}