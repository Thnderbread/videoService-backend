import axios from "../api/axios"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../common/Modal/Modal";
import { readUploadedFile } from "../utils/utils";


const Home = () => {
    const [userFiles, setUserFiles] = useState([]);

    const [itemId, setItemId] = useState(null); // pass in ids exactly as the are (mongoDB ids)
    const [actionType, setActionType] = useState(''); // file action being performed
    const [newFileName, setNewFileName] = useState('')
    const [oldFileName, setOldFileName] = useState('');
    const [modalActive, setModalActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // const [file, setFile] = useState(null);
    // const [newFileName, setNewFileName] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);


    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/home'

    useEffect(() => {
        handleGetFiles()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const signOut = async () => {
        try {
            await axios.post('/auth/logout', {
                withCredentials: true
            });
            // deleteCookies()
            navigate('/')
        } catch (error) {
            console.error(error);
            alert('Something went wrong.');
        }
    }

    const handleSessionExpiration = () => {
        setIsButtonDisabled(true);
        alert('Session expired. Sign in again.');
        // setTimeout(() => {
        //     navigate('/')
        // }, 2000)
    }

    const handleGetFiles = async () => {
        try {
            const response = await axios.get('/api/files/files',
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            setUserFiles(prevFiles => {
                return [...response.data.userFiles]
            });

            return response.data.userFiles
        } catch (error) {
            console.error('Error:', error);
            if (!error.response) {
                alert('No server response.')
            }
            const responseCode = error.response?.status;
            if (responseCode === 401) {
                handleSessionExpiration();
            } else {
                alert('Something went wrong.')
            }
        }
    }

    const handleRenameFile = async (fileId, newFileName) => {
        if (!fileId) {
            alert("No fileId, can't complete request.");
            return;
        } else if (!newFileName) {
            alert('Please supply a new name.')
            return;
        } else if (newFileName.toLocaleLowerCase().split('.')[0] === oldFileName.toLowerCase().split('.')[0]) {
            alert('Filenames cannot match.')
        } else if (newFileName.includes('.')) {
            alert('No periods allowed. The file extension will automatically be added.');
        } else if (!/[a-zA-Z{3,}]/.test(newFileName)) {
            // at least 3 consecutive letters
            alert('Filename needs more characters.')
        }

        try {
            const response = await axios.put(`api/files/rename/${fileId}/${encodeURIComponent(newFileName)}`,
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            const updatedFile = response.data.updatedFile

            setUserFiles(prevFiles => prevFiles.map(file => {
                if (file._id === fileId) {
                    return {
                        ...file,
                        fileName: updatedFile.fileName,
                        fileModifiedDate: updatedFile.fileModifiedDate,
                    }
                }
                return file;
            }));

            alert('Renamed file.');
            return;

        } catch (error) {
            console.error(`Error: ${error}`);

            if (!error.response) {
                alert('No server response.');
            }
            const responseCode = error.response?.status;
            const responseErrorMessage = error.response?.data.error;

            if (responseCode === 400) {
                alert(responseErrorMessage)
            } else if (responseCode === 401) {
                handleSessionExpiration();
            } else if (responseCode === 409) {
                alert('Could not rename that file.');
            } else {
                alert('Something went wrong. Could not complete the request.')
            }
        } finally {

        }
    }

    const handleDeleteFile = async (fileId) => {
        if (!fileId) {
            alert("Couldn't complete the request.")
        }

        try {
            await axios.delete(`api/files/delete/${fileId}`);
            setUserFiles(prevFiles => prevFiles.filter(file => file._id !== fileId));
            alert('File deleted successfully.')
        } catch (error) {
            if (!error.response) {
                alert('No server response.');
            }
            const responseCode = error.response?.status;
            const responseErrorMessage = error.response?.data.error;

            if (responseCode === 401) {
                handleSessionExpiration();
            } else if (responseCode === 409) {
                alert(responseErrorMessage);
            } else {
                alert('Something went wrong. Could not complete the request.')
            }
        }
    }

    const handleUploadFile = async (file) => {
        if (!file) {
            alert('no file.');
            return;
        }

        const rawFile = await readUploadedFile(file);

        const fileObject = {
            data: rawFile,
            name: file.name,
            size: file.size
        }

        try {
            const response = await axios.post('/api/files/upload', { file: fileObject });
            setUserFiles(prevFiles => [...prevFiles, response.data.newFile]);
            return;
        } catch (error) {
            console.error(`Error: ${error}`);

            if (!error.response) {
                alert('No server response.');
            }
            const responseCode = error.response?.status;
            const responseErrorMessage = error.response?.data.error;

            if (responseCode === 400) {
                alert(responseErrorMessage)
            } else if (responseCode === 401) {
                handleSessionExpiration();
            } else if (responseCode === 409) {
                alert(responseErrorMessage);
            } else if (responseCode === 415) {
                alert(responseErrorMessage)
            } else if (responseCode === 507) {
                alert(responseErrorMessage + "Max file size is 30 MB.")
            } else {
                alert('Something went wrong. Could not complete the request.')
            }
        }
    }

    const handleDownloadFile = async (fileId, fileName) => {
        if (!fileId) {
            alert('Cannot complete the request.');
            return;
        }

        try {
            const response = await axios.get(`/api/files/download/${fileId}`, {
                responseType: 'blob'
            });
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const downloadLink = document.createElement('a');

            downloadLink.href = downloadUrl;
            downloadLink.setAttribute('download', fileName);

            document.body.appendChild(downloadLink);
            downloadLink.click()

            return;
        } catch (error) {
            console.error(`Error: ${error}`);

            if (!error.response) {
                alert('No server response.');
            }
            const responseCode = error.response?.status;
            const responseErrorMessage = error.response?.data.error;

            if (responseCode === 400) {
                alert(responseErrorMessage)
            } else if (responseCode === 401) {
                handleSessionExpiration();
            } else {
                alert('Something went wrong. Could not complete the request.')
            }
        }
    }

    const showModal = (actionType, fileId, fileName) => {
        setActionType(actionType)
        setOldFileName(fileName || null) // or null for upload / delete case
        setItemId(fileId || null) // or null for upload case
        setModalActive(true);
    }

    const handleConfirm = async (actionType, fileId) => {
        // debugger;
        if (actionType === 'rename') {
            if (newFileName.toLowerCase().split('.')[0] === oldFileName.toLowerCase().split('.')[0]) {
                alert('New filename cannot match old filename.');
                return;
            } else if (newFileName.includes('.')) {
                alert('No periods allowed. The file extension will automatically be added.');
                return;
            }
            setModalActive(false);
            await handleRenameFile(fileId, newFileName);
            setActionType('');
            setOldFileName('');
            setNewFileName('')
            setItemId(null);
        } else if (actionType === 'upload') {
            if (selectedFile === null) {
                alert('Missing file.');
                return;
            }
            setModalActive(false);
            await handleUploadFile(selectedFile);
            setActionType('');
            setItemId(null);
        } else if (actionType === 'delete') {
            setModalActive(false);
            await handleDeleteFile(fileId);
            setActionType('');
            setItemId(null);
        }
    }

    const showFileSize = (fileSize) => {
        // convert from bytes to megabytes or kilobytes 
        // based on file size
        return fileSize / 1_000_000 > 1
            ? `${fileSize / 1_000_000} MB`
            : `${fileSize / 1000} KB`
    }

    const showDate = (date) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
        return date.toLocaleString(window.navigator.language, options).trim().split('T')[0]
    }

    const renderFiles = () => (
        <div className="files-container">
            {userFiles && userFiles.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>File Size</th>
                            <th>File Upload Date</th>
                            <th>File Modified Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {userFiles.map((file) =>
                            <tr key={file._id}>
                                <td className="file-data">{file.fileName}</td>
                                <td className="file-data">{showFileSize(file.fileSize)}</td>
                                <td className="file-data">{showDate(file.fileUploadDate)}</td>
                                <td className="file-data">{showDate(file.fileModifiedDate || file.fileUploadDate)}</td>
                                <td>
                                    <button
                                        className="file-action download"
                                        onClick={() => handleDownloadFile(file._id, file.fileName)}
                                        disabled={isButtonDisabled}>
                                        Download
                                    </button>
                                    <button
                                        className="file-action rename"
                                        onClick={() => showModal('rename', file._id, file.fileName)}
                                        disabled={isButtonDisabled}>
                                        Rename File
                                    </button>
                                    <button
                                        className="file-action delete"
                                        onClick={() => showModal('delete', file._id)}
                                        disabled={isButtonDisabled}>
                                        Delete File
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            ) : (
                <div>
                    <p>No files.</p>
                </div>
            )}
        </div>
    )

    const renderModal = () => (
        <Modal
            modalActive={modalActive}
            setModalActive={setModalActive}
            newFileName={newFileName}
            setNewFileName={setNewFileName}
            oldFileName={oldFileName}
            actionType={actionType}
            setActionType={setActionType}
            itemId={itemId}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            onConfirm={handleConfirm}
        />
    )

    return (
        <div className="main">
            <button className="sign-out" onClick={signOut}>Sign Out</button>

            <button
                className="file-action upload"
                onClick={() => showModal('upload')}
                disabled={isButtonDisabled}>
                Upload New File
            </button>

            {renderModal()}


            <h1>Your Files:</h1>
            {renderFiles()}

        </div>
    )
}

export default Home