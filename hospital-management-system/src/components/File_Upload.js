import React, { Component } from "react";
class File_Upload extends Component {
  state = {};
  render() {
    return (
      <>
        <div className="mb-3">
          <label htmlFor="formFile" className="form-label">
            Default file input example
          </label>
          <input className="form-control" type="file" id="formFile" />
        </div>
      </>
    );
  }
}

export default File_Upload;
