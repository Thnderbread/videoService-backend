import { useEffect, useState } from 'react';
import styles from './Modal.module.css'

const Modal = ({ modalActive, setModalActive, newFileName, setNewFileName, oldFileName, actionType, setActionType, itemId, selectedFile, setSelectedFile, onConfirm }) => {
    const handleCancel = () => {
        setActionType('');
        setNewFileName('');
        setSelectedFile(null);
        setModalActive(false)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    }

    return (
        <div className={`${styles.modal} ${modalActive ? styles.visible : ''}`}>
            <div className={styles['modal-content']}>
                {actionType === 'rename' && (
                    <div>
                        <label className={styles.label} htmlFor="renameFile">New Filename:</label>
                        <input
                            className={styles['text-input']}
                            type="text"
                            id="renameFile"
                            value={newFileName}
                            placeholder={oldFileName.split('.')[0]} // remove file extension from display
                            onChange={(e) => setNewFileName(e.target.value)}
                        />
                    </div>
                )}

                {actionType === 'upload' && (
                    <div>
                        <label className={styles.label} htmlFor="file">Select a file:</label>
                        {/* <div className={styles['file-input']}> */}


                        <input
                            className={styles['file-input-label']}
                            type="file"
                            id="file"
                            max={31_457_280}
                            multiple={false}
                            required={true}
                            onChange={(e) => handleFileChange(e)}
                        />
                        {/* <span className={styles['file-input-label']}>Choose a file</span> */}
                        {/* </div> */}
                    </div>
                )}

                {actionType === 'delete' && (
                    <div>
                        <label className={styles.label}>Are you sure?</label>
                        <br />
                    </div>
                )}

                <div className={styles['modal-buttons']}>
                    <button className={styles['modal-cancel']} onClick={handleCancel}>Cancel</button>
                    <button className={styles['modal-confirm']} onClick={() => onConfirm(actionType, itemId)}>Confirm</button>
                </div>
            </div>
        </div>
    )
}

export default Modal