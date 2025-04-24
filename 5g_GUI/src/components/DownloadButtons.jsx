import React from 'react';
import axios from 'axios';

const DownloadButtons = () => {

    const downloadCaptureFile = () => {
        axios({
            url: 'http://localhost:5000/download-capture',
            method: 'GET',
            responseType: 'blob', // Important for downloading files
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'LaaS-5GSA-k8s-TMforum.cap');
            document.body.appendChild(link);
            link.click();
        }).catch((error) => {
            console.error('Error downloading capture file:', error);
        });
    };

    const downloadLogFile = () => {
        axios({
            url: 'http://localhost:5000/download-log',
            method: 'GET',
            responseType: 'blob',
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'logs_2024-10-01-20-45-51.tar.gz');
            document.body.appendChild(link);
            link.click();
        }).catch((error) => {
            console.error('Error downloading log file:', error);
        });
    };

    return (
        <div>
            <button onClick={downloadCaptureFile}>Download Capture File</button>
            <button onClick={downloadLogFile}>Download Log File</button>
        </div>
    );
};

export default DownloadButtons;
