import axios from "axios";
import {useState} from "react";
import {ReactPhotoEditor} from "react-photo-editor";
import {API_BASE_URL} from "../constants";

export default function Uploader({ refreshPage }) {
  const [file, setFile] = useState(undefined);
  const setFileData = (e) => {
    if (e?.target?.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }
  const onSubmit = (editedFile) => {
    setFile(editedFile)
    let randStr = Math.random().toString(36).slice(2)
    axios
      .post(`${API_BASE_URL}/images`, {
        title: `Title ${randStr}`,
        description: `This is my file ${randStr}`,
        contentType: file.type,
      })
      .then((resp) => {
        return resp.data.signedUrl
      })
      .then(async (signedUrl) => {
        axios
          .put(signedUrl, editedFile)
          .then(() => {
            // refresh after 1 second to allow s3 processing
            setTimeout(() => refreshPage(Math.random()), 1000)
          })
      })
  }

  return (
    <div className="border p-6">
      <h3 className="font-bold pb-3">Upload New File</h3>
      <input 
        type="file" 
        onChange={(e) => setFileData(e)} 
        multiple={false} 
        value={file?.filename}
      />
      <ReactPhotoEditor
        open={file !== undefined}
        onClose={() => setFile(undefined)}
        file={file}
        onSaveImage={onSubmit}
      />
    </div>
  );
}
